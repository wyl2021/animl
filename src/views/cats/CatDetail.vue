<template>
  <div class="cat-detail">
    <h2>猫咪详情</h2>
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    <div v-else-if="cat" class="cat-detail-content">
      <div class="cat-main">
        <div class="cat-image-section">
          <img :src="cat.image || '/vite.svg'" :alt="cat.name">
        </div>
        <div class="cat-info-section">
          <div class="cat-header">
            <h3>{{ cat.name }}</h3>
            <span class="cat-breed">{{ cat.breed }}</span>
          </div>
          <div class="cat-meta">
            <span class="cat-age">{{ cat.age }}岁</span>
            <span class="cat-time">{{ formatDate(cat.created_at) }}</span>
          </div>
          <div class="cat-description">
            <h4>关于这只猫咪</h4>
            <p>{{ cat.description }}</p>
          </div>
          <div class="cat-actions">
            <button @click="likeCat" class="action-btn like-btn" :class="{ 'liked': cat.liked, 'loading': liking }">
              <span class="icon">{{ cat.liked ? '❤️' : '🤍' }}</span>
              <span>{{ cat.likes || 0 }}</span>
              <span class="action-text">{{ cat.liked ? '已点赞' : '点赞' }}</span>
            </button>
            <button class="action-btn share-btn">
              <span class="icon">📤</span>
              <span class="action-text">分享</span>
            </button>
            <router-link :to="`/cats/edit/${cat.id}`" class="action-btn edit-btn">
              <span class="icon">✏️</span>
              <span class="action-text">编辑</span>
            </router-link>
            <router-link to="/cats" class="action-btn back-btn">
              <span class="icon">⬅️</span>
              <span class="action-text">返回社区</span>
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- 评论区 -->
      <div class="comments-section">
        <h4>评论 ({{ comments.length }})</h4>
        
        <!-- 评论输入 -->
        <div class="comment-form">
          <textarea v-model="newComment" placeholder="写下你的评论..." rows="3" :disabled="submittingComment"></textarea>
          <button @click="submitComment" class="btn btn-primary" :disabled="!newComment.trim() || submittingComment">
            {{ submittingComment ? '提交中...' : '发表评论' }}
          </button>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-list">
          <div v-if="loadingComments" class="loading-comments">
            <p>加载评论中...</p>
          </div>
          <div v-else>
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <span class="avatar">{{ getAvatarText(comment.user) }}</span>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.user }}</span>
                  <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-actions">
                  <button @click="likeComment(comment.id)" class="comment-action-btn like-btn" :class="{ 'liked': comment.liked, 'loading': likingComments.includes(comment.id) }">
                    <span class="icon">{{ comment.liked ? '❤️' : '🤍' }}</span>
                    <span>{{ comment.likes || 0 }}</span>
                  </button>
                  <button class="comment-action-btn reply-btn">
                    <span class="icon">↩️</span>
                    <span>回复</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="comments.length === 0" class="no-comments">
              <p>还没有评论，快来发表第一条评论吧！</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="error">
      <p>猫咪信息加载失败</p>
      <router-link to="/cats" class="btn btn-secondary">返回社区</router-link>
    </div>
  </div>
</template>

<script>
import catApi from '../../api/catApi';

export default {
  name: 'CatDetail',
  data() {
    return {
      cat: null,
      loading: true,
      liking: false,
      newComment: '',
      comments: [],
      loadingComments: true,
      submittingComment: false,
      likingComments: []
    };
  },
  mounted() {
    this.loadCat();
    this.loadComments();
  },
  methods: {
    async loadCat() {
      try {
        const id = parseInt(this.$route.params.id);
        const catData = await catApi.getCat(id);
        this.cat = catData;
      } catch (error) {
        console.error('获取猫咪详情失败:', error);
      } finally {
        this.loading = false;
      }
    },
    async loadComments() {
      try {
        this.loadingComments = true;
        const catId = parseInt(this.$route.params.id);
        const commentsData = await catApi.getComments(catId);
        this.comments = commentsData;
      } catch (error) {
        console.error('获取评论失败:', error);
      } finally {
        this.loadingComments = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffDays > 0) {
        return `${diffDays}天前`;
      } else if (diffHours > 0) {
        return `${diffHours}小时前`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}分钟前`;
      } else {
        return '刚刚';
      }
    },
    async likeCat() {
      if (!this.cat || this.liking) return;
      
      try {
        this.liking = true;
        if (this.cat.liked) {
          // 取消点赞
          await catApi.unlikeCat(this.cat.id);
          this.cat.likes--;
        } else {
          // 点赞
          await catApi.likeCat(this.cat.id);
          this.cat.likes++;
        }
        this.cat.liked = !this.cat.liked;
      } catch (error) {
        console.error('点赞操作失败:', error);
      } finally {
        this.liking = false;
      }
    },
    async submitComment() {
      if (!this.newComment.trim() || this.submittingComment) return;
      
      try {
        this.submittingComment = true;
        const catId = parseInt(this.$route.params.id);
        const commentData = {
          content: this.newComment.trim(),
          user: '当前用户' // 实际项目中应该从登录状态获取用户名
        };
        const newComment = await catApi.addComment(catId, commentData);
        this.comments.unshift(newComment);
        this.newComment = '';
        // 更新猫咪的评论数
        this.cat.comments = (this.cat.comments || 0) + 1;
      } catch (error) {
        console.error('发表评论失败:', error);
      } finally {
        this.submittingComment = false;
      }
    },
    async likeComment(commentId) {
      const comment = this.comments.find(c => c.id === commentId);
      if (!comment || this.likingComments.includes(commentId)) return;
      
      try {
        this.likingComments.push(commentId);
        // 这里可以添加评论点赞的API调用
        // 暂时只更新本地状态
        if (comment.liked) {
          comment.likes--;
        } else {
          comment.likes++;
        }
        comment.liked = !comment.liked;
      } catch (error) {
        console.error('评论点赞失败:', error);
      } finally {
        this.likingComments = this.likingComments.filter(id => id !== commentId);
      }
    },
    getAvatarText(username) {
      return username.charAt(0).toUpperCase();
    }
  }
};
</script>

<style scoped>
.cat-detail {
  padding: 2rem 0;
}

h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  color: #666;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.cat-detail-content {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cat-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.cat-image-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.cat-image-section img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cat-info-section {
  display: flex;
  flex-direction: column;
}

.cat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.cat-header h3 {
  font-size: 1.8rem;
  margin: 0;
  color: #333;
}

.cat-breed {
  background-color: #f0f0f0;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.9rem;
  color: #666;
}

.cat-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #999;
}

.cat-description {
  margin-bottom: 2rem;
  flex: 1;
}

.cat-description h4 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
}

.cat-description p {
  line-height: 1.6;
  color: #666;
  margin: 0;
}

.cat-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.like-btn {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.like-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.like-btn.liked {
  background-color: #ffe6e6;
  color: #ff4757;
  border-color: #ff4757;
}

.share-btn {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.share-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.edit-btn {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.edit-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.back-btn {
  background-color: #6c757d;
  color: white;
}

.back-btn:hover {
  background-color: #5a6268;
}

.icon {
  font-size: 1.1rem;
}

.action-text {
  font-size: 0.9rem;
}

/* 评论区 */
.comments-section {
  padding: 2rem;
  border-top: 1px solid #f0f0f0;
}

.comments-section h4 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: #333;
}

/* 加载评论状态 */
.loading-comments {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 8px;
}

/* 点赞按钮加载状态 */
.like-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.like-btn.loading .icon {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 评论点赞按钮加载状态 */
.comment-action-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.comment-action-btn.loading .icon {
  animation: pulse 1s infinite;
}

/* 评论点赞按钮样式 */
.comment-action-btn.liked {
  color: #ff4757;
}

.comment-action-btn.liked:hover {
  background-color: #ffe6e6;
}

.comment-form {
  margin-bottom: 2rem;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
}

.comment-form textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.comment-item:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comment-avatar {
  display: flex;
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-user {
  font-weight: bold;
  color: #333;
}

.comment-time {
  font-size: 0.85rem;
  color: #999;
}

.comment-text {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.5;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-size: 0.85rem;
}

.comment-action-btn:hover {
  background-color: #e9e9e9;
  color: #333;
}

.no-comments {
  text-align: center;
  padding: 3rem;
  color: #666;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.btn {
  padding: 0.8rem 1.8rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-primary:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .cat-main {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .cat-image-section img {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .cat-detail {
    padding: 1rem 0;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .cat-main {
    padding: 1.5rem;
  }
  
  .cat-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .cat-actions {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .action-btn {
    justify-content: center;
  }
  
  .comments-section {
    padding: 1.5rem;
  }
  
  .comment-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .comment-avatar {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .cat-main {
    padding: 1rem;
  }
  
  .cat-header h3 {
    font-size: 1.4rem;
  }
  
  .comments-section {
    padding: 1rem;
  }
  
  .comment-form {
    padding: 1rem;
  }
}
</style>