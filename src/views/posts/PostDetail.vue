<template>
  <div class="post-detail">
    <el-card class="post-card">
      <el-card-header>
        <div class="post-header">
          <div class="user-info">
            <el-avatar :size="48" :src="post.user_avatar || ''" :alt="post.user_name">
              {{ getAvatarText(post.user_name) }}
            </el-avatar>
            <div class="user-details">
              <div class="user-name">{{ post.user_name }}</div>
              <div class="post-time">{{ formatDate(post.created_at) }}</div>
            </div>
          </div>
          <div class="post-actions">
            <el-dropdown>
              <el-button size="small" type="text">
                <el-icon>
                  <More />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="editPost">编辑</el-dropdown-item>
                  <el-dropdown-item @click="deletePost" type="danger">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-card-header>
      <el-card-body>
        <h1 class="post-title">{{ post.title }}</h1>
        <p class="post-content">{{ post.content }}</p>

        <!-- 帖子图片 -->
        <div v-if="post.images && post.images.length > 0" class="post-images"
          :class="getImageLayoutClass(post.images.length)">
          <el-image v-for="(image, index) in post.images" :key="index" :src="getImageUrl(image)" fit="cover"
            class="post-image" :preview-src-list="post.images.map(img => getImageUrl(img))" preview-teleported
            show-toolbar :initial-index="index"></el-image>
        </div>

        <!-- 帖子视频 -->
        <div v-if="post.video" class="post-video">
          <video :src="getVideoUrl(post.video)" controls class="video-player"></video>
        </div>

        <!-- 帖子统计信息 -->
        <div class="post-stats">
          <el-tag size="small" class="cat-tag">
            猫咪: {{ post.cat_name }} ({{ post.cat_breed }})
          </el-tag>
          <div class="stats">
            <span class="stat-item">
              <el-button size="small" :type="post.isLiked ? 'danger' : 'default'" @click="likePost">
                <el-icon>
                  <Star />
                </el-icon>
                {{ post.isLiked ? '已点赞' : '点赞' }} {{ post.likes_count || 0 }}
              </el-button>
            </span>
            <!-- <span class="stat-item">
              <el-button size="small">
                <el-icon>
                  <ChatDotRound />
                </el-icon>
                评论 {{ post.comments_count || 0 }}
              </el-button>
            </span> -->
          </div>
        </div>
      </el-card-body>
    </el-card>

    <!-- 评论区 -->
    <div class="comments-section">
      <h2 class="section-title">评论 ({{ comments.length }})</h2>

      <!-- 评论输入 -->
      <el-card class="comment-input-card">
        <el-card-body>
          <el-form :model="commentForm" label-width="0">
            <el-form-item>
              <el-input v-model="commentForm.content" type="textarea" :rows="3" placeholder="写下你的评论..."></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitComment" :loading="submittingComment">发布评论</el-button>
            </el-form-item>
          </el-form>
        </el-card-body>
      </el-card>

      <!-- 评论列表 -->
      <div class="comments-list">
        <el-card v-for="comment in comments" :key="comment.id" class="comment-card">
          <el-card-body>
            <div class="comment-header">
              <el-avatar :size="36" :src="comment.user_avatar || ''" :alt="comment.user_name">
                {{ getAvatarText(comment.user_name) }}
              </el-avatar>
              <div class="comment-user-info">
                <div class="comment-user-name">{{ comment.user_name }}</div>
                <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button size="small" :type="comment.isLiked ? 'danger' : 'default'" @click="likeComment(comment)">
                <el-icon>
                  <Star />
                </el-icon>
                {{ comment.isLiked ? '已点赞' : '点赞' }} {{ comment.likes_count || 0 }}
              </el-button>
              <el-button size="small" @click="replyToComment(comment)">回复</el-button>
            </div>

            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <el-card v-for="reply in comment.replies" :key="reply.id" class="reply-card">
                <el-card-body>
                  <div class="comment-header">
                    <el-avatar :size="28" :src="reply.user_avatar || ''" :alt="reply.user_name">
                      {{ getAvatarText(reply.user_name) }}
                    </el-avatar>
                    <div class="comment-user-info">
                      <div class="comment-user-name">{{ reply.user_name }}</div>
                      <div class="comment-time">{{ formatDate(reply.created_at) }}</div>
                    </div>
                  </div>
                  <div class="comment-content">{{ reply.content }}</div>
                  <div class="comment-actions">
                    <el-button size="small" :type="reply.isLiked ? 'danger' : 'default'" @click="likeComment(reply)">
                      <el-icon>
                        <Star />
                      </el-icon>
                      {{ reply.isLiked ? '已点赞' : '点赞' }} {{ reply.likes_count || 0 }}
                    </el-button>
                    <el-button size="small" @click="replyToComment(reply)">回复</el-button>
                  </div>
                </el-card-body>
              </el-card>
            </div>
          </el-card-body>
        </el-card>

        <div v-if="comments.length === 0" class="empty-comments">
          暂无评论，快来抢沙发吧！
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Star, ChatDotRound, More } from '@element-plus/icons-vue'

export default {
  name: 'PostDetail',
  data() {
    return {
      post: {
        id: '',
        title: '',
        content: '',
        user_name: '',
        user_avatar: '',
        created_at: '',
        likes_count: 0,
        comments_count: 0,
        isLiked: false,
        images: [],
        video: '',
        cat_name: '',
        cat_breed: ''
      },
      comments: [],
      commentForm: {
        content: '',
        parent_id: null
      },
      submittingComment: false,
      loading: false
    }
  },
  mounted() {
    const postId = this.$route.params.id
    if (postId) {
      this.fetchPostDetail(postId)
      this.fetchComments(postId)
    }
  },
  methods: {
    // 获取帖子详情
    async fetchPostDetail(postId) {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('获取帖子详情失败')
        }

        this.post = await response.json()
      } catch (error) {
        ElMessage.error('获取帖子详情失败: ' + error.message)
        console.error('获取帖子详情错误:', error)
      } finally {
        this.loading = false
      }
    },

    // 获取评论列表
    async fetchComments(postId) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('获取评论失败')
        }

        const commentsData = await response.json()
        // 构建评论树
        this.comments = this.buildCommentTree(commentsData)
      } catch (error) {
        ElMessage.error('获取评论失败: ' + error.message)
        console.error('获取评论错误:', error)
      }
    },

    // 构建评论树
    buildCommentTree(comments) {
      const commentMap = {}
      const rootComments = []

      // 首先创建所有评论的映射
      comments.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] }
      })

      // 然后构建评论树
      comments.forEach(comment => {
        if (comment.parent_id) {
          // 这是一个回复
          if (commentMap[comment.parent_id]) {
            commentMap[comment.parent_id].replies.push(commentMap[comment.id])
          }
        } else {
          // 这是一个根评论
          rootComments.push(commentMap[comment.id])
        }
      })

      return rootComments
    },

    // 提交评论
    async submitComment() {
      if (!this.commentForm.content) {
        ElMessage.error('请填写评论内容')
        return
      }

      this.submittingComment = true
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:3000/api/comments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: this.getUserId(),
            post_id: this.post.id,
            content: this.commentForm.content,
            parent_id: this.commentForm.parent_id
          })
        })

        if (!response.ok) {
          throw new Error('发布评论失败')
        }

        const newComment = await response.json()
        this.fetchComments(this.post.id)
        this.commentForm.content = ''
        this.commentForm.parent_id = null
        this.post.comments_count = (this.post.comments_count || 0) + 1
        ElMessage.success('评论发布成功！')
      } catch (error) {
        ElMessage.error('发布评论失败: ' + error.message)
        console.error('发布评论错误:', error)
      } finally {
        this.submittingComment = false
      }
    },

    // 点赞帖子
    async likePost() {
      try {
        const token = localStorage.getItem('token')
        const url = this.post.isLiked
          ? 'http://localhost:3000/api/likes'
          : 'http://localhost:3000/api/likes'

        const method = this.post.isLiked ? 'DELETE' : 'POST'

        const response = await fetch(url, {
          method: method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: this.getUserId(),
            post_id: this.post.id
          })
        })

        if (!response.ok) {
          throw new Error(this.post.isLiked ? '取消点赞失败' : '点赞失败')
        }

        this.post.isLiked = !this.post.isLiked
        this.post.likes_count = (this.post.likes_count || 0) + (this.post.isLiked ? 1 : -1)
        ElMessage.success(this.post.isLiked ? '点赞成功！' : '取消点赞成功！')
      } catch (error) {
        ElMessage.error(error.message)
        console.error('点赞操作错误:', error)
      }
    },

    // 点赞评论
    async likeComment(comment) {
      try {
        const token = localStorage.getItem('token')
        const url = `http://localhost:3000/api/comments/${comment.id}/like`
        const method = comment.isLiked ? 'DELETE' : 'POST'

        const response = await fetch(url, {
          method: method,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(comment.isLiked ? '取消点赞失败' : '点赞失败')
        }

        comment.isLiked = !comment.isLiked
        comment.likes_count = (comment.likes_count || 0) + (comment.isLiked ? 1 : -1)
        ElMessage.success(comment.isLiked ? '点赞成功！' : '取消点赞成功！')
      } catch (error) {
        ElMessage.error(error.message)
        console.error('点赞评论错误:', error)
      }
    },

    // 回复评论
    replyToComment(comment) {
      this.commentForm.parent_id = comment.id
      ElMessage.info(`回复: ${comment.user_name}`)
    },

    // 编辑帖子
    editPost() {
      // 编辑帖子逻辑
      ElMessage.info('编辑帖子功能开发中')
    },

    // 删除帖子
    async deletePost() {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:3000/api/posts/${this.post.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('删除帖子失败')
        }

        ElMessage.success('帖子删除成功！')
        this.$router.push('/interact')
      } catch (error) {
        ElMessage.error('删除帖子失败: ' + error.message)
        console.error('删除帖子错误:', error)
      }
    },

    // 获取用户ID
    getUserId() {
      const userStr = localStorage.getItem('user')
      try {
        const user = JSON.parse(userStr)
        return user.id || 2
      } catch {
        return 2
      }
    },

    // 获取头像文本
    getAvatarText(userName) {
      if (!userName) return 'U'
      return userName.charAt(0).toUpperCase()
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor(diffMs / (1000 * 60))

      if (diffDays > 0) {
        return `${diffDays}天前`
      } else if (diffHours > 0) {
        return `${diffHours}小时前`
      } else if (diffMinutes > 0) {
        return `${diffMinutes}分钟前`
      } else {
        return '刚刚'
      }
    },

    // 获取图片URL
    getImageUrl(image) {
      if (!image) return ''
      if (image.startsWith('http')) {
        return image
      }
      return `http://localhost:3000/uploads/${image}`
    },

    // 获取视频URL
    getVideoUrl(video) {
      if (!video) return ''
      if (video.startsWith('http')) {
        return video
      }
      return `http://localhost:3000/uploads/${video}`
    },

    // 获取图片布局类名
    getImageLayoutClass(imageCount) {
      if (imageCount === 1) {
        return 'image-layout-1'
      } else if (imageCount === 2) {
        return 'image-layout-2'
      } else if (imageCount === 3) {
        return 'image-layout-3'
      } else if (imageCount === 4) {
        return 'image-layout-4'
      } else {
        return 'image-layout-multi'
      }
    }
  }
}
</script>

<style scoped>
.post-detail {
  padding: 2rem 0;
  width: 100%;
}

.post-card {
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.post-time {
  font-size: 0.8rem;
  color: #999;
}

.post-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  color: #333;
}

.post-content {
  margin: 0 0 1.5rem 0;
  color: #666;
  line-height: 1.8;
  font-size: 1.1rem;
}

/* 图片布局样式 */
.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 1.5rem 0;
  position: relative;
  max-width: 100%;
}

.image-layout-1 {
  max-width: 600px;
}

.image-layout-1 .post-image {
  width: 100%;
  height: 400px;
}

.image-layout-2 .post-image {
  width: calc(50% - 4px);
  height: 250px;
}

.image-layout-3 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
}

.image-layout-3 .post-image:first-child {
  grid-row: span 2;
  width: 100%;
  height: 100%;
}

.image-layout-3 .post-image:not(:first-child) {
  width: 100%;
  height: calc(50% - 4px);
}

.image-layout-4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;
}

.image-layout-4 .post-image {
  width: 100%;
  height: 200px;
}

.image-layout-multi {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 8px;
}

.image-layout-multi .post-image {
  width: 100%;
  height: 150px;
}

/* 图片样式 */
.post-image {
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.02);
}

.post-video {
  margin: 1.5rem 0;
}

.video-player {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
}

.post-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.cat-tag {
  background-color: #f0f9ff;
  color: #1677ff;
}

.stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
}

/* 评论区样式 */
.comments-section {
  margin-top: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
}

.comment-input-card {
  margin-bottom: 2rem;
  border-radius: 12px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  border-radius: 12px;
  overflow: hidden;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.8rem;
}

.comment-user-name {
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 0.8rem;
  color: #999;
}

.comment-content {
  margin-bottom: 0.8rem;
  color: #666;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 12px;
}

.replies-list {
  margin-top: 1rem;
  margin-left: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.reply-card {
  border-radius: 8px;
  border-left: 3px solid #e6f7ff;
}

.empty-comments {
  text-align: center;
  padding: 3rem;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-detail {
    padding: 1rem 0;
  }

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .post-title {
    font-size: 1.4rem;
  }

  .post-content {
    font-size: 1rem;
  }

  .image-layout-1 .post-image {
    height: 250px;
  }

  .image-layout-2 .post-image {
    height: 180px;
  }

  .image-layout-4 .post-image {
    height: 150px;
  }

  .image-layout-multi .post-image {
    height: 120px;
  }

  .post-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stats {
    width: 100%;
    justify-content: space-between;
  }

  .replies-list {
    margin-left: 1rem;
  }
}
</style>