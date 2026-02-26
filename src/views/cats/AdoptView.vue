<template>
  <div class="adopt-view">
    <h2>猫咪领养</h2>
    <!-- <div class="action-bar">
      <el-button type="primary" @click="$router.push('/cats/add')">分享猫咪</el-button>
    </div> -->
    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <el-button @click="fetchCats">重试</el-button>
    </div>
    <div v-else>
      <el-row :gutter="20">
        <el-col v-for="cat in cats" :key="cat.id" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="cat-card" shadow="hover" @click="goToCatDetail(cat.id)">
            <template #cover>
              <!-- <div class="cat-image">
                <img :src="cat.image || '/vite.svg'" :alt="cat.name" class="cat-img"
                  @error="handleImageError($event, cat)" @loadstart="handleImageLoadStart(cat)"
                  @load="handleImageLoad(cat)" />
                <div v-if="loadingImages.includes(cat.id)" class="image-loading">
                  <el-icon class="is-loading">
                    <Loading />
                  </el-icon>
                </div>
              </div> -->
            </template>
            <el-card-body>
              <el-image :src="cat.image || '/vite.svg'" :alt="cat.name" class="cat-img"
                @error="handleImageError($event, cat)" @loadstart="handleImageLoadStart(cat)"
                @load="handleImageLoad(cat)"></el-image>
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
                <el-button @click.stop="likeCat(cat.id)" :type="cat.isLiked ? 'danger' : 'default'"
                  :loading="likingCats.includes(cat.id)" size="small">
                  {{ cat.isLiked ? '已点赞' : '点赞' }} {{ cat.likes || 0 }}
                </el-button>
                <el-button @click.stop="goToCatDetail(cat.id)" size="small">详情</el-button>
              </div>
            </el-card-body>
          </el-card>
        </el-col>
      </el-row>
      <div v-if="cats.length === 0" class="empty-state">
        <p>暂无猫咪信息</p>
        <el-button type="primary" @click="$router.push('/cats/add')">分享第一只猫咪</el-button>
      </div>
      <div class="pagination-wrapper">
        <el-pagination v-if="totalPages > 1" v-model:current-page="currentPage" :page-size="pageSize"
          :total="totalItems" layout="prev, pager, next, jumper" @current-change="fetchCats" />
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import catApi from '../../api/catApi'

export default {
  name: 'AdoptView',
  data() {
    return {
      cats: [],
      loading: false,
      error: '',
      currentPage: 1,
      pageSize: 8,
      totalPages: 1,
      totalItems: 0,
      likingCats: [],
      loadingImages: []
    }
  },
  mounted() {
    this.fetchCats()
  },
  watch: {
    // 当路由变化时重新加载数据
    $route: {
      handler() {
        this.fetchCats()
      },
      // 深度监听
      deep: true
    }
  },
  methods: {
    async fetchCats() {
      try {
        this.loading = true
        this.error = ''
        const response = await catApi.getCats(this.currentPage, this.pageSize)
        this.cats = response.data
        console.log(this.cats)
        this.totalItems = response.total
        this.totalPages = response.totalPages
      } catch (error) {
        console.error('获取猫咪列表失败:', error)
        this.error = '获取猫咪列表失败'
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
        if (cat.isLiked) {
          await catApi.unlikeCat(catId)
          cat.likes--
        } else {
          await catApi.likeCat(catId)
          cat.likes++
        }
        cat.isLiked = !cat.isLiked
      } catch (error) {
        console.error('点赞操作失败:', error)
        ElMessage.error('点赞操作失败')
      } finally {
        this.likingCats = this.likingCats.filter(id => id !== catId)
      }
    },

    // 处理图片加载错误
    handleImageError(event, cat) {
      event.target.src = '/vite.svg'
      this.loadingImages = this.loadingImages.filter(id => id !== cat.id)
    },

    // 处理图片加载开始
    handleImageLoadStart(cat) {
      if (!this.loadingImages.includes(cat.id)) {
        this.loadingImages.push(cat.id)
      }
    },

    // 处理图片加载完成
    handleImageLoad(cat) {
      this.loadingImages = this.loadingImages.filter(id => id !== cat.id)
    }
  }
}
</script>

<style scoped>
.adopt-view {
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

/* 图片样式优化 */
.cat-image {
  height: 200px;
  overflow: hidden;
  position: relative;
  background-color: #f5f5f5;
  border-radius: 12px 12px 0 0;
}

.cat-img {
  width: 100%;
  height: 150px;
  /* object-fit: cover; */
  transition: all 0.3s ease;
  border-radius: 12px 12px 0 0;
}

.cat-card:hover .cat-img {
  transform: scale(1.05);
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px 12px 0 0;
}

.image-loading .is-loading {
  font-size: 24px;
  color: #ffd6e0;
}

/* 图片错误状态 */
.cat-img[src="/vite.svg"] {
  background-color: #f0f0f0;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-state {
  padding: 2rem 0;
  text-align: center;
  color: #721c24;
  background-color: #f8d7da;
  border-radius: 8px;
  margin: 1rem 0;
}

.error-state p {
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #666;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

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
  height: 72px;
  flex: 1;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
  /* justify-content: ; */
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
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
  .adopt-view {
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