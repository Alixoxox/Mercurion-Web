# Plan: Fix Feedback Image Not Showing After Submission

## Problem
When user submits feedback with an image on product detail page:
1. Local preview uses `URL.createObjectURL()` (temporary browser-only URL)
2. After submission, `selectedImage.set(null)` clears the local preview immediately
3. `loadFeedback()` fetches from API but new feedback with `feedbackImage` may not be displayed
4. User only sees image after re-visiting page (re-fetches from API)

## Root Cause (Detailed)
1. **`submitFeedback()` clears preview too early** (product-detail.ts:203): `this.selectedImage.set(null)` is called immediately after submit, before the API response with the stored `feedbackImage` URL is consumed
2. **Template has no fallback to `f.feedbackImage`**: The feedback list (line 227-228) shows `f.feedbackImage`, but the local preview section (lines 145-150) only shows `selectedImageUrl()` - when this is cleared, there's no fallback to the stored image from API
3. **No persistence of local preview state**: After clearing `selectedImage`, the UI doesn't wait for or show the newly submitted feedback image from the API

## Solution

### 1. Template Changes (product-detail.html)
Modify the feedback image display section to show fallback to `f.feedbackImage` when no local selection:

**Current code (lines 145-151):**
```html
<img *ngIf="selectedImage()" [src]="selectedImageUrl()!" alt="Selected feedback image"
     class="w-16 h-16 object-cover rounded-lg border border-gray-200" />
<img *ngIf="editingFeedback()?.feedbackImage && !selectedImage()" [src]="editingFeedback()?.feedbackImage" alt="Current feedback image"
     class="w-16 h-16 object-cover rounded-lg border border-gray-200" />
```

**Changed to:**
```html
<!-- Show local selected image preview first -->
<img *ngIf="selectedImage()" [src]="selectedImageUrl()!" alt="Selected feedback image"
     class="w-16 h-16 object-cover rounded-lg border border-gray-200" />

<!-- Show stored feedback image from API as fallback -->
<img *ngIf="!selectedImage() && editingFeedback()?.feedbackImage" [src]="editingFeedback()?.feedbackImage" alt="Current feedback image"
     class="w-16 h-16 object-cover rounded-lg border border-gray-200" />

<!-- Show stored feedback image from API when not editing and no local selection -->
<img *ngIf="!selectedImage() && !editingFeedback() && orderedFeedback().length > 0"
     *ngFor="let f of orderedFeedback()"
     [src]="f.feedbackImage" 
     *ngIf="f.feedbackImage"
     alt="(f.userName || 'Anonymous') + ' feedback'"
     class="w-16 h-16 object-cover rounded-lg border border-gray-200" />
```

Wait, need to rethink this. The template currently shows images per-feedback-item in the list (lines 227-228), but the local preview is separate. Let me reconsider the approach.

Actually, looking at the template more carefully:

- Lines 145-146: Local preview when `selectedImage()` is set (for new feedback submission)
- Lines 147-148: Shows `editingFeedback()?.feedbackImage` when editing
- Lines 227-228: Shows `f.feedbackImage` for each feedback item in the list

The issue is that after submission:
1. `selectedImage.set(null)` clears the local preview
2. `loadFeedback()` is called but the UI doesn't automatically show the newly submitted feedback's image

The fix should ensure that after `loadFeedback()`, the newly submitted feedback (which now has a `feedbackImage` URL from the backend) is visible in the `orderedFeedback` list.

### 2. Component Changes (product-detail.ts)
Ensure the feedback state is properly updated after submission:

**Current `submitFeedback()` (lines 187-214):**
```typescript
submitFeedback(): void {
    // ... validation
    this.submitting.set(true);
    this.userService.rateProduct(productId, this.myRating(), this.comment().trim(), this.selectedImage()).subscribe({
      next: (message: string) => {
        this.toast.success(message?.trim() || 'Feedback submitted successfully!', 'Success', { timeOut: 2000, progressBar: true });
        this.myRating.set(0);
        this.comment.set("");
        this.selectedImage.set(null);  // <-- clears local preview immediately
        this.loadFeedback();  // <-- fetches feedback but doesn't preserve the just-submitted one
        this.refreshProduct(productId);
      },
      // ...
    });
  }
```

**Issue:** `this.selectedImage.set(null)` clears the preview, then `loadFeedback()` fetches all feedback. But the newly submitted feedback (with its `feedbackImage` URL) should now be visible in the list.

**Fix:** Remove the immediate `this.selectedImage.set(null)` and instead rely on the `loadFeedback()` call to populate the feedback. The template will then show `f.feedbackImage` from the API response.

Actually, we need to be careful - we still want to clear the local file reference, but we should let the API data populate the UI.

Better approach: Keep `this.selectedImage.set(null)` to clean up the File object, but ensure the template shows `f.feedbackImage` from the fetched feedback.

### 3. Workflow
1. User selects image → local preview shows via `selectedImageUrl()` 
2. User submits feedback → `selectedImage.set(null)` clears File reference
3. `loadFeedback()` fetches all feedback including just-submitted one with `feedbackImage` URL
4. Template displays `f.feedbackImage` from the API response for the new feedback item
5. User sees the image immediately without needing to re-visit the page

## Verification Steps
- Submit feedback with image on product detail page
- Verify image shows immediately after submission without page reload
- Verify image persists when navigating away and back to the product detail page  
- Ensure local preview still works for new image selections before submission
- Check that `f.feedbackImage` from API responses is properly displayed in the feedback list
- Verify no memory leaks from object URLs (revoke still works on destroy)