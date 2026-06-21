package com.auction.api.repository;

import com.auction.api.entity.Auction;
import com.auction.api.entity.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, String>, JpaSpecificationExecutor<Auction> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :id")
    Optional<Auction> findByIdForUpdate(@Param("id") String id);

    List<Auction> findByStatus(AuctionStatus status);
    List<Auction> findBySellerId(String sellerId);
    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, LocalDateTime endTime);

    long countByStatus(AuctionStatus status);
    long countByVerificationStatus(com.auction.api.entity.VerificationStatus verificationStatus);

    @Query("SELECT SUM(a.currentBid) FROM Auction a WHERE a.status = :status")
    BigDecimal sumCurrentBidByStatus(@Param("status") AuctionStatus status);

    @Query("SELECT SUM(a.platformFee) FROM Auction a WHERE a.status = :status")
    BigDecimal sumPlatformFeeByStatus(@Param("status") AuctionStatus status);

    @Query("SELECT SUM(a.buyerPremium) FROM Auction a WHERE a.status = :status")
    BigDecimal sumBuyerPremiumByStatus(@Param("status") AuctionStatus status);
}
