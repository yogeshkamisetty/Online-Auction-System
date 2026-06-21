package com.auction.api.controller;

import com.auction.api.dto.AuctionResponse;
import com.auction.api.dto.WatchlistResponse;
import com.auction.api.security.CustomUserDetails;
import com.auction.api.service.WatchlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistService watchlistService;

    public WatchlistController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @GetMapping
    public ResponseEntity<List<AuctionResponse>> getWatchlist(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(watchlistService.getWatchlist(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<WatchlistResponse> addToWatchlist(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, String> body
    ) {
        String auctionId = body.get("auctionId");
        if (auctionId == null || auctionId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(watchlistService.addToWatchlist(userDetails.getId(), auctionId));
    }

    @DeleteMapping("/{auctionId}")
    public ResponseEntity<Map<String, String>> removeFromWatchlist(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String auctionId
    ) {
        watchlistService.removeFromWatchlist(userDetails.getId(), auctionId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Removed from watchlist");
        return ResponseEntity.ok(response);
    }
}
