<template>
  <div class="cat-community">
    <h2>猫咪社区</h2>
    <div class="action-bar">
      <router-link to="/cats/add" class="btn btn-primary">分享猫咪</router-link>
    </div>
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    <div v-else>
      <div class="cat-grid">
        <div v-for="cat in cats" :key="cat.id" class="cat-card" @click="goToCatDetail(cat.id)">
          <div class="cat-image">
            <img :src="cat.image || '/vite.svg'" :alt="cat.name">
          </div>
          <div class="cat-info">
            <div class="cat-header">
              <h3>{{ cat.name }}</h3>
              <span class="cat-breed">{{ cat.breed }}</span>
            </div>
            <p class="cat-description">{{ truncateDescription(cat.description) }}</p>
            <div class="cat-stats">
              <span class="cat-age">{{ cat.age }}岁</span>
              <span class="cat-time">{{ formatDate(cat.created_at) }}</span>
            </div>
            <div class="cat-actions">
              <button @click.stop="likeCat(cat.id)" class="action-btn like-btn" :class="{ 'liked': cat.liked, 'loading': likingCats.includes(cat.id) }">
                <span class="icon">{{ cat.liked ? '❤️' : '🤍' }}</span>
                <span>{{ cat.likes || 0 }}</span>
              </button>
              <button @click.stop="goToCatDetail(cat.id)" class="action-btn comment-btn">
                <span class="icon">💬</span>
                <span>{{ cat.comments || 0 }}</span>
              </button>
              <button @click.stop="goToCatDetail(cat.id)" class="action-btn view-btn">
                <span class="icon">👁️</span>
                <span>详情</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="cats.length === 0" class="empty-state">
        <p>还没有猫咪分享，快来分享你的猫咪吧！</p>
        <router-link to="/cats/add" class="btn btn-primary">分享第一只猫咪</router-link>
      </div>
      <div v-if="totalPages > 1" class="pagination">
        <button @click="changePage(1)" class="page-btn" :disabled="currentPage === 1">首页</button>
        <button @click="changePage(currentPage - 1)" class="page-btn" :disabled="currentPage === 1">上一页</button>
        <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
        <button @click="changePage(currentPage + 1)" class="page-btn" :disabled="currentPage === totalPages">下一页</button>
        <button @click="changePage(totalPages)" class="page-btn" :disabled="currentPage === totalPages">末页</button>
      </div>
    </div>
  </div>
</template>

<script>
import catApi from '../../api/catApi';

export default {
  name: 'CatList',
  data() {
    return {
      cats: [],
      loading: true,
      currentPage: 1,
      pageSize: 6,
      totalPages: 1,
      totalItems: 0,
      likingCats: [] // 正在点赞的猫咪ID列表，用于显示加载状态
    };
  },
  mounted() {
    this.fetchCats();
  },
  methods: {
    async fetchCats() {
      try {
        this.loading = true;
        const response = await catApi.getCats(this.currentPage, this.pageSize);
        this.cats = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
      } catch (error) {
        console.error('获取猫咪列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    goToCatDetail(catId) {
      this.$router.push(`/cats/${catId}`);
    },
    truncateDescription(description) {
      if (!description) return '';
      return description.length > 100 ? description.substring(0, 100) + '...' : description;
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
    async likeCat(catId) {
      const cat = this.cats.find(c => c.id === catId);
      if (!cat || this.likingCats.includes(catId)) return;
      
      try {
        this.likingCats.push(catId);
        if (cat.liked) {
          // 取消点赞
          await catApi.unlikeCat(catId);
          cat.likes--;
        } else {
          // 点赞
          await catApi.likeCat(catId);
          cat.likes++;
        }
        cat.liked = !cat.liked;
      } catch (error) {
        console.error('点赞操作失败:', error);
      } finally {
        this.likingCats = this.likingCats.filter(id => id !== catId);
      }
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.fetchCats();
    }
  }
};
</script>

<style scoped>
.cat-community {
  padding: 2rem 0;
}

h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
}

.action-bar {
  margin-bottom: 2rem;
  text-align: center;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式卡片网格 */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.cat-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
}

.cat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.cat-card:active {
  transform: translateY(-4px) scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.1s ease;
}

.cat-image {
  height: 200px;
  overflow: hidden;
}

.cat-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cat-card:hover .cat-image img {
  transform: scale(1.05);
}

.cat-info {
  padding: 1.5rem;
  flex: 1;
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
  font-size: 1.2rem;
  margin: 0;
  color: #333;
}

.cat-breed {
  background-color: #f0f0f0;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #666;
}

.cat-description {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.5;
  flex: 1;
}

.cat-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #999;
}

.cat-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  z-index: 1;
  position: relative;
}

.action-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.like-btn.liked {
  color: #ff4757;
}

.like-btn.liked:hover {
  background-color: #ffe6e6;
}

.icon {
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.btn {
  display: inline-block;
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

.btn-primary:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
  transition: all 0.1s ease;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #4CAF50;
  color: #4CAF50;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
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

/* 响应式分页 */
@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .page-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .page-info {
    order: -1;
    width: 100%;
    text-align: center;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .cat-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .cat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .cat-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .cat-community {
    padding: 1rem 0;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .cat-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .cat-card {
    margin: 0 1rem;
  }
  
  .cat-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-btn {
    justify-content: center;
    border-radius: 8px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .pagination-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .cat-info {
    padding: 1rem;
  }
  
  .cat-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .cat-breed {
    align-self: flex-start;
  }
}
</style>