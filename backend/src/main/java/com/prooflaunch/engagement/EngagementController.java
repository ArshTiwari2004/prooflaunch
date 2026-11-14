package com.prooflaunch.engagement;

import com.prooflaunch.common.PageResponse;
import com.prooflaunch.engagement.dto.EngagementDtos.EngagementResult;
import com.prooflaunch.engagement.dto.EngagementDtos.FeedbackView;
import com.prooflaunch.engagement.dto.EngagementDtos.TryCompleteRequest;
import com.prooflaunch.engagement.dto.EngagementDtos.TryStartResponse;
import com.prooflaunch.engagement.dto.EngagementDtos.ViewerState;
import com.prooflaunch.security.AuthUser;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products/{productId}")
public class EngagementController {

    private final EngagementService engagement;

    public EngagementController(EngagementService engagement) {
        this.engagement = engagement;
    }

    @PutMapping("/upvote")
    public EngagementResult upvote(@PathVariable long productId, @AuthenticationPrincipal AuthUser user) {
        return engagement.upvote(user.id(), productId);
    }

    @DeleteMapping("/upvote")
    public EngagementResult removeUpvote(@PathVariable long productId, @AuthenticationPrincipal AuthUser user) {
        return engagement.removeUpvote(user.id(), productId);
    }

    @PostMapping("/try/start")
    public TryStartResponse startTry(@PathVariable long productId, @AuthenticationPrincipal AuthUser user) {
        return engagement.startTry(user.id(), productId);
    }

    @PostMapping("/try/complete")
    public EngagementResult completeTry(@PathVariable long productId, @AuthenticationPrincipal AuthUser user,
                                        @Valid @RequestBody TryCompleteRequest req) {
        return engagement.completeTry(user.id(), productId, req);
    }

    @GetMapping("/tries")
    public PageResponse<FeedbackView> feedback(@PathVariable long productId,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return engagement.feedback(productId, Math.max(0, page), Math.min(Math.max(1, size), 50));
    }

    /** Public: anonymous callers get a neutral state instead of a 401, so the page can render the right call-to-action. */
    @GetMapping("/viewer")
    public ViewerState viewer(@PathVariable long productId, @AuthenticationPrincipal AuthUser user) {
        return engagement.viewerState(user == null ? null : user.id(), productId);
    }
}
