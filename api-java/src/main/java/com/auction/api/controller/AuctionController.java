package com.auction.api.controller;

import com.auction.api.dto.*;
import com.auction.api.security.CustomUserDetails;
import com.auction.api.service.AuctionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @GetMapping
    public ResponseEntity<List<AuctionResponse>> getAuctions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String sellerId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(auctionService.getAuctions(status, featured, sellerId, category, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponse> getAuctionById(@PathVariable String id) {
        return ResponseEntity.ok(auctionService.getAuctionById(id));
    }

    @PostMapping
    public ResponseEntity<AuctionResponse> createAuction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateAuctionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(auctionService.createAuction(userDetails.getId(), request));
    }

    @PatchMapping("/{id}/settle")
    public ResponseEntity<SettleResponse> settleAuction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id
    ) {
        return ResponseEntity.ok(auctionService.settleAuction(userDetails.getId(), id));
    }
}
