package com.auction.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "\"Auction\"", indexes = {
    @Index(name = "idx_auction_status_featured", columnList = "status, featured"),
    @Index(name = "idx_auction_seller_id", columnList = "sellerId"),
    @Index(name = "idx_auction_verification_status", columnList = "verificationStatus")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    private String condition;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal startPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal currentBid;

    @Column(nullable = false)
    @Builder.Default
    private Integer bidCount = 0;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuctionStatus status = AuctionStatus.PENDING;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(precision = 12, scale = 2)
    private BigDecimal platformFee;

    @Column(precision = 12, scale = 2)
    private BigDecimal buyerPremium;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.UNVERIFIED;

    private String verifiedBy;

    private String verificationNotes;

    @Column(name = "sellerId", nullable = false, insertable = false, updatable = false)
    private String sellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sellerId", nullable = false)
    private User seller;

    @OneToMany(mappedBy = "auction")
    private List<Bid> bids;

    @OneToMany(mappedBy = "auction")
    private List<Watchlist> watchlist;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
