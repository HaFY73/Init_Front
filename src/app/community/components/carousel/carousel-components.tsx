"use client"

import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Share2, Bookmark, Heart, MessageCircle, UserPlus, UserCheck } from "lucide-react"
import type { Post as FeedPagePostType, Category as FeedPageCategoryType } from "@/app/community/feed/page"
import Image from "next/image"

const MAX_VISIBILITY = 3

const getCategoryLabel = (post: FeedPagePostType, allCategories: FeedPageCategoryType[]): string => {
  const jobCat = allCategories.find((c) => c.key === post.jobCategory && c.type === "job")
  const topicCat = allCategories.find((c) => c.key === post.topicCategory && c.type === "topic")
  return jobCat?.label || topicCat?.label || "일반"
}

export interface AdaptedPostCardProps {
  post: FeedPagePostType
  allCategories: FeedPageCategoryType[]
  onCardClick: (post: FeedPagePostType) => void
  onLike: (postId: number) => void
  onFollowToggle: (authorName: string) => void // Added onFollowToggle prop
  isActive: boolean
}

export const AdaptedPostCard = ({
  post,
  allCategories,
  onCardClick,
  onLike,
  onFollowToggle,
  isActive,
}: AdaptedPostCardProps) => {
  const displayCategoryLabel = getCategoryLabel(post, allCategories)
  const authorInitial = post.author.name ? post.author.name[0].toUpperCase() : "A"

  const handleCardClick = () => {
    if (isActive) {
      onCardClick(post)
    }
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike(post.id)
  }

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFollowToggle(post.author.name)
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isActive) onCardClick(post)
  }

  return (
    <div className={`card ${isActive ? "cursor-pointer" : ""}`} onClick={handleCardClick}>
      <div className="post-header">
        <div className="avatar">{authorInitial}</div>
        <div className="post-meta">
          <div className="author-name">{post.author.name}</div>
          <div className="post-time">{post.timeAgo}</div>
        </div>
        {/* Follow Button */}
        <button
          onClick={handleFollowClick}
          className={`ml-auto p-1.5 rounded-full text-xs flex items-center transition-colors ${
            post.author.isFollowing
              ? "bg-violet-500 text-white hover:bg-violet-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          title={post.author.isFollowing ? "팔로잉" : "팔로우"}
        >
          {post.author.isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
          <span className="ml-1 hidden sm:inline">{post.author.isFollowing ? "팔로잉" : "팔로우"}</span>
        </button>
      </div>
      <div className="post-category-container">
        <div className="post-category-badge">{displayCategoryLabel}</div>
      </div>
      {post.imageUrl?.trim() && post.imageUrl.trim() !== "/placeholder.svg" && (
          <div className="relative w-full h-[200px] bg-gray-100 rounded-md">
            <Image
                src={post.imageUrl.trim()}
                alt={"Post image"}
                fill
                style={{ objectFit: "contain" }}
                className="rounded-md"
            />
          </div>
      )}
      <p className="post-content">{post.content}</p>
      {post.hashtags && post.hashtags.length > 0 && (
          <div className="post-hashtags flex flex-wrap gap-2 mt-2">
            {post.hashtags.map((tag, idx) => (
                <span
                    key={idx}
                    className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full"
                >
        {tag}
      </span>
            ))}
          </div>
      )}
      <div className="post-stats">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1 p-1 text-gray-500 hover:text-red-500 transition-colors"
            title="좋아요"
            onClick={handleLikeClick}
          >
            <Heart size={16} fill={post.likedByMe ? "currentColor" : "none"} />
            <span>{post.likes}</span>
          </button>
          <button
            className="flex items-center gap-1 p-1 text-gray-500 hover:text-blue-500 transition-colors"
            title="댓글"
            onClick={handleCommentClick}
          >
            <MessageCircle size={16} />
            <span>{post.comments}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/*<button
            className="p-1 text-gray-500 hover:text-green-500 transition-colors"
            title="공유하기"
            onClick={(e) => {
              e.stopPropagation()
              console.log("Share post:", post.id)
            }}
          >
            <Share2 size={16} />
          </button>*/}
          <button
            className="p-1 text-gray-500 hover:text-orange-500 transition-colors"
            title="저장하기"
            onClick={(e) => {
              e.stopPropagation()
              console.log("Bookmark post:", post.id)
            }}
          >
            <Bookmark size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export interface CarouselProps {
  children: React.ReactNode[]
  initialActiveIndex?: number
  onCardClick: (post: FeedPagePostType) => void
}

export const Carousel = ({ children, initialActiveIndex = 0, onCardClick }: CarouselProps) => {
  const [active, setActive] = useState(0)
  const count = React.Children.count(children)

  useEffect(() => {
    const newActive = Math.max(0, Math.min(initialActiveIndex, count > 0 ? count - 1 : 0))
    setActive(newActive)
  }, [initialActiveIndex, count])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (count === 0) return
      if (event.key === "ArrowLeft") {
        setActive((i) => (i - 1 + count) % count)
      } else if (event.key === "ArrowRight") {
        setActive((i) => (i + 1) % count)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [count, active])

  const handlePrev = () => {
    setActive((i) => (i - 1 + count) % count)
  }

  const handleNext = () => {
    setActive((i) => (i + 1) % count)
  }

  if (count === 0) {
    return (
      <div className="carousel-empty flex items-center justify-center h-[28rem] text-gray-500">
        표시할 게시글이 없습니다.
      </div>
    )
  }

  return (
    <div className="carousel">
      {count > 1 && (
        <button className="nav left" onClick={handlePrev}>
          <ChevronLeft size={24} />
        </button>
      )}
      {React.Children.map(children, (child, i) => {
        const childElement = child as React.ReactElement<AdaptedPostCardProps>
        let offset = active - i
        if (Math.abs(offset) > count / 2) {
          offset = offset > 0 ? offset - count : offset + count
        }

        return (
          <div
            key={childElement.key || i}
            className="card-container"
            style={
              {
                "--active": i === active ? 1 : 0,
                "--offset": offset / 3,
                "--direction": Math.sign(offset),
                "--abs-offset": Math.abs(offset) / 3,
                pointerEvents: i === active ? "auto" : "none",
                opacity: Math.abs(offset) >= MAX_VISIBILITY ? 0 : 1,
                display: Math.abs(offset) > MAX_VISIBILITY ? "none" : "block",
              } as React.CSSProperties
            }
          >
            {React.cloneElement(childElement, {
              onCardClick: onCardClick,
              isActive: i === active,
            })}
          </div>
        )
      })}
      {count > 1 && (
        <button className="nav right" onClick={handleNext}>
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  )
}
