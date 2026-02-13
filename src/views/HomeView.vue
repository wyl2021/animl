<template>
  <div class="cat-community">
    <h2>猫咪社区</h2>
    <div class="action-bar">
      <el-button type="primary" @click="$router.push('/cats/add')">分享猫咪</el-button>
    </div>
    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else>
      <el-row :gutter="20">
        <el-col v-for="cat in cats" :key="cat.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="cat-card" shadow="hover" @click="goToCatDetail(cat.id)">
            <template #cover>
              <div class="cat-image">
                <img :src="cat.image || '/vite.svg'" :alt="cat.name">
              </div>
            </template>
            <el-card-body>
              <div class="cat-header">
                <h3>{{ cat.name }}</h3>
                <el-tag size="small">{{ cat.breed }}</el-tag>
              </div>
              <p class="cat-description">{{ truncateDescription(cat.description) }}</p>
              <div class="cat-stats">
                <el-tag type="info" size="small">{{ cat.age }}岁</el-tag>
                <span class="cat-time">{{ formatDate(cat.created_at) }}</span>
              </div>
              <div class="cat-actions">
                <el-button 
                  @click.stop="likeCat(cat.id)" 
                  :type="cat.liked ? 'danger' : 'default'" 
                  :loading="likingCats.includes(cat.id)"
                  size="small"
                  circle>
                  {{ cat.liked ? '❤️' : '🤍' }} {{ cat.likes || 0 }}
                </el-button>
                <el-button @click.stop="goToCatDetail(cat.id)" size="small" circle>
                  💬 {{ cat.comments || 0 }}
                </el-button>
                <el-button @click.stop="goToCatDetail(cat.id)" size="small">详情</el-button>
              </div>
            </el-card-body>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="cats.length === 0" description="还没有猫咪分享">
        <el-button type="primary" @click="$router.push('/cats/add')">分享第一只猫咪</el-button>
      </el-empty>
      <div class="pagination-wrapper">
        <el-pagination
          v-if="totalPages > 1"
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          layout="prev, pager, next, jumper"
          @current-change="fetchCats"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import catApi from '../api/catApi'

export default {
  name: 'HomeView',
  data() {
    return {
      cats: [],
      loading: true,
      currentPage: 1,
      pageSize: 8,
      totalPages: 1,
      totalItems: 0,
      likingCats: []
    }
  },
  mounted() {
    this.fetchCats()
  },
  methods: {
    async fetchCats() {
      try {
        this.loading = true
        const response = await catApi.getCats(this.currentPage, this.pageSize)
        this.cats = response.data
        this.totalItems = response.total
        this.totalPages = response.totalPages
      } catch (error) {
        console.error('获取猫咪列表失败:', error)
        ElMessage.error('获取猫咪列表失败')
      } finally {
        this.loading = false
      }
    },
    goToCatDetail(catId) {
      this.$router.push(`/cats/${catId}`)
    },
    truncateDescription(description) {
      if (!description) return ''
      return description.length > 100 ? description.substring(0, 100) + '...' : description
    },
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
    async likeCat(catId) {
      const cat = this.cats.find(c => c.id === catId)
      if (!cat || this.likingCats.includes(catId)) return
      
      try {
        this.likingCats.push(catId)
        if (cat.liked) {
          await catApi.unlikeCat(catId)
          cat.likes--
        } else {
          await catApi.likeCat(catId)
          cat.likes++
        }
        cat.liked = !cat.liked
      } catch (error) {
        console.error('点赞操作失败:', error)
        ElMessage.error('点赞操作失败')
      } finally {
        this.likingCats = this.likingCats.filter(id => id !== catId)
      }
    }
  }
}
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
</style>