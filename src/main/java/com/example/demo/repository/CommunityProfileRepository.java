package com.example.demo.repository;

import com.example.demo.entity.CommunityProfile;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommunityProfileRepository extends JpaRepository<CommunityProfile, Long> {
    
    // 사용자 ID로 커뮤니티 프로필 조회
    Optional<CommunityProfile> findByUser(User user);
    
    Optional<CommunityProfile> findByUserId(Long userId);
    
    // 닉네임으로 프로필 조회
    Optional<CommunityProfile> findByNickname(String nickname);
    
    // 닉네임 중복 체크
    boolean existsByNickname(String nickname);
    
    // 표시 이름으로 검색 (LIKE 검색)
    @Query("SELECT cp FROM CommunityProfile cp WHERE cp.displayName LIKE %:name%")
    java.util.List<CommunityProfile> findByDisplayNameContaining(@Param("name") String name);
    
    // 공개 프로필만 조회
    @Query("SELECT cp FROM CommunityProfile cp WHERE cp.isPublic = true")
    java.util.List<CommunityProfile> findPublicProfiles();
    
    // 팔로워 수 기준 상위 프로필 조회
    @Query("SELECT cp FROM CommunityProfile cp WHERE cp.isPublic = true ORDER BY cp.followersCount DESC")
    java.util.List<CommunityProfile> findTopProfilesByFollowers(org.springframework.data.domain.Pageable pageable);
}
