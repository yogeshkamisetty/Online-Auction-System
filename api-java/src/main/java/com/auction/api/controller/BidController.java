package com.auction.api.controller;

import com.auction.api.dto.BidResponse;
import com.auction.api.dto.MyBidsResponse;
import com.auction.api.dto.PlaceBidRequest;
import com.auction.api.security.CustomUserDetails;
import com.auction.api.service.BidService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<MyBidsResponse>> getMyBids(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(bidService.getMyBids(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<BidResponse> placeBid(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PlaceBidRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bidService.placeBid(userDetails.getId(), request));
    }
}
