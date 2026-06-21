package com.auction.api.dto;

import com.auction.api.entity.AuctionStatus;
import com.auction.api.entity.VerificationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionResponse {
    private String id;
    private String title;
    private String description;
    private String category;
    private String condition;
    private String imageUrl;
    private BigDecimal startPrice;
    private BigDecimal currentBid;
    private Integer bidCount;
    private LocalDateTime endTime;
    private AuctionStatus status;
    private Boolean featured;
    private BigDecimal platformFee;
    private BigDecimal buyerPremium;
    private VerificationStatus verificationStatus;
    private String verifiedBy;
    private String verificationNotes;
    private String sellerId;
    private UserResponse seller;
    private List<BidResponse> bids;
    private LocalDateTime createdAt;
}
