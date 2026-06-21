package com.auction.api.controller;

import com.auction.api.dto.*;
import com.auction.api.security.CustomUserDetails;
import com.auction.api.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/auctions")
    public ResponseEntity<AdminAuctionsResponse> getAuctions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String verificationStatus,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "50") int take,
            @RequestParam(defaultValue = "0") int skip
    ) {
        return ResponseEntity.ok(adminService.getAuctions(status, verificationStatus, search, take, skip));
    }

    @PatchMapping("/auctions/{id}")
    public ResponseEntity<AuctionResponse> updateAuction(
            @PathVariable String id,
            @RequestBody UpdateAuctionAdminRequest request
    ) {
        return ResponseEntity.ok(adminService.updateAuction(id, request));
    }

    @DeleteMapping("/auctions/{id}")
    public ResponseEntity<Map<String, String>> deleteAuction(@PathVariable String id) {
        adminService.deleteAuction(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Auction removed");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/auctions/{id}/verify")
    public ResponseEntity<AuctionResponse> verifyAuction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody VerifyAuctionRequest request
    ) {
        return ResponseEntity.ok(adminService.verifyAuction(id, userDetails.getUsername(), request));
    }

    @GetMapping("/users")
    public ResponseEntity<AdminUsersResponse> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "50") int take,
            @RequestParam(defaultValue = "0") int skip
    ) {
        return ResponseEntity.ok(adminService.getUsers(search, take, skip));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody UpdateUserAdminRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUser(userDetails.getId(), id, request));
    }

    @GetMapping("/auctions/{id}/bids")
    public ResponseEntity<List<BidResponse>> getAuctionBids(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getAuctionBids(id));
    }
}
