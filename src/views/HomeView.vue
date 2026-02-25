<template>
  <div class="cat-community">
    <el-row :gutter="20">
      <!-- 今日热门猫咪 -->
      <el-col :xs="24" :md="8">
        <div class="hot-cats-section">
          <h3>今日热门猫咪</h3>
          <div v-if="loading.hotCats" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="error.hotCats" class="error-state">
            <p>{{ error.hotCats }}</p>
            <el-button size="small" @click="fetchHotCats">重试</el-button>
          </div>
          <div v-else>
            <div class="hot-cat-item" v-for="(cat, index) in hotCats" :key="cat.id || index">
              <div class="cat-image" @click="goToCatDetail(cat.id)">
                <img :src="cat.image" :alt="cat.name">
              </div>
              <div class="cat-tag">{{ cat.name }}</div>
            </div>
            <div v-if="hotCats.length === 0" class="empty-state">
              <p>暂无热门猫咪</p>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 最新领养信息 -->
      <el-col :xs="24" :md="8">
        <div class="adoption-section">
          <h3>最新领养信息</h3>
          <div v-if="loading.adoptions" class="loading-state">
            <el-skeleton :rows="4" animated />
          </div>
          <div v-else-if="error.adoptions" class="error-state">
            <p>{{ error.adoptions }}</p>
            <el-button size="small" @click="fetchLatestAdoptions">重试</el-button>
          </div>
          <div v-else>
            <div v-if="latestAdoptions.length === 0" class="empty-state">
              <p>暂无领养信息</p>
            </div>
            <div v-else class="adoption-carousel">
              <div class="carousel-container" :style="{ transform: `translateX(-${currentAdoptionIndex * 100}%)` }">
                <div class="carousel-item" v-for="(cat, index) in latestAdoptions" :key="cat.id || index">
                  <div class="adoption-image" @click="goToCatDetail(cat.id)">
                    <img :src="cat.image" :alt="cat.name">
                  </div>
                  <div class="adoption-info">
                    <div class="age">年龄: {{ cat.age_display || cat.age }}</div>
                    <div class="breed">品种: {{ cat.breed }}</div>
                    <div class="requirements">
                      要求: {{ cat.adoption_requirements || cat.requirements }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="adoption-dots">
                <span v-for="(dot, index) in latestAdoptions.length" :key="index" class="dot"
                  :class="{ active: index === currentAdoptionIndex }" @click="currentAdoptionIndex = index"></span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 社区话题 -->
      <el-col :xs="24" :md="8">
        <div class="community-section">
          <h3>社区话题</h3>
          <div class="topic-tabs">
            <span class="tab" :class="{ active: activeTab === 'attention' }" @click="activeTab = 'attention'">卡注</span>
            <span class="tab" :class="{ active: activeTab === 'hot' }" @click="activeTab = 'hot'">热的</span>
            <span class="tab" :class="{ active: activeTab === 'hundred' }" @click="activeTab = 'hundred'">百片</span>
          </div>
          <div class="topic-item" v-for="(topic, index) in topics" :key="index">
            <div class="topic-image">
              <img :src="topic.image" :alt="topic.title">
            </div>
            <div class="topic-content">
              <div class="topic-title">{{ topic.title }}</div>
              <div class="topic-price">¥{{ topic.price }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import catApi from '../api/catApi'

export default {
  name: 'HomeView',
  data() {
    return {
      // 今日热门猫咪数据
      hotCats: [],
      // 最新领养信息
      latestAdoptions: [],
      // 社区话题数据
      topics: [
        {
          title: '热门单住标题，今干作标题',
          image: 'https://picsum.photos/id/44/100/100',
          price: 30
        },
        {
          title: '热门单住标题，藐参与标题',
          image: 'https://picsum.photos/id/45/100/100',
          price: 60
        },
        {
          title: '热门单住标题，藐参与标题',
          image: 'https://picsum.photos/id/46/100/100',
          price: 30
        }
      ],
      // 加载状态
      loading: {
        hotCats: false,
        adoptions: false
      },
      // 错误信息
      error: {
        hotCats: '',
        adoptions: ''
      },
      // 活跃的标签页
      activeTab: 'attention',
      // 当前领养信息索引（用于轮播）
      currentAdoptionIndex: 0,
      // 轮播定时器
      carouselTimer: null
    }
  },
  mounted() {
    // 页面加载时获取数据
    this.fetchHotCats()
    this.fetchLatestAdoptions()
  },

  updated() {
    // 数据更新后启动轮播
    this.startCarousel()
  },

  beforeUnmount() {
    // 组件销毁时清除定时器
    this.clearCarousel()
  },
  methods: {
    // 获取热门猫咪
    async fetchHotCats() {
      try {
        this.loading.hotCats = true
        this.error.hotCats = ''
        const data = await catApi.getHotCats()
        this.hotCats = data.length > 0 ? data : [
          {
            name: '猫咪',
            image: 'https://picsum.photos/id/40/200/150'
          },
          {
            name: '喵咪',
            image: 'https://picsum.photos/id/41/200/150'
          },
          {
            name: '哈咪',
            image: 'https://picsum.photos/id/42/200/150'
          }
        ]
      } catch (error) {
        console.error('获取热门猫咪失败:', error)
        this.error.hotCats = '获取热门猫咪失败'
        // 使用默认数据作为 fallback
        this.hotCats = [
          {
            name: '猫咪',
            image: 'https://picsum.photos/id/40/200/150'
          },
          {
            name: '喵咪',
            image: 'https://picsum.photos/id/41/200/150'
          },
          {
            name: '哈咪',
            image: 'https://picsum.photos/id/42/200/150'
          }
        ]
      } finally {
        this.loading.hotCats = false
      }
    },

    // 获取最新领养信息
    async fetchLatestAdoptions() {
      try {
        this.loading.adoptions = true
        this.error.adoptions = ''
        const data = await catApi.getLatestAdoptions()
        this.latestAdoptions = data.length > 0 ? data : [
          {
            name: '小橘',
            image: 'https://picsum.photos/id/43/300/200',
            age: '⭐ ⭐',
            breed: '下妊',
            requirements: '2023年2月1场、雅充请者及待要求'
          }
        ]
      } catch (error) {
        console.error('获取最新领养信息失败:', error)
        this.error.adoptions = '获取领养信息失败'
        // 使用默认数据作为 fallback
        this.latestAdoptions = [
          {
            name: '小橘',
            image: 'https://picsum.photos/id/43/300/200',
            age: '⭐ ⭐',
            breed: '下妊',
            requirements: '2023年2月1场、雅充请者及待要求'
          }
        ]
      } finally {
        this.loading.adoptions = false
      }
    },

    // 跳转到猫咪详情页
    goToCatDetail(catId) {
      if (catId) {
        this.$router.push(`/cats/${catId}`)
      }
    },

    // 启动轮播
    startCarousel() {
      // 先清除之前的定时器
      this.clearCarousel()

      // 只有当有多个领养信息时才启动轮播
      if (this.latestAdoptions.length > 1) {
        this.carouselTimer = setInterval(() => {
          this.nextAdoption()
        }, 3000) // 每3秒切换一次
      }
    },

    // 清除轮播定时器
    clearCarousel() {
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer)
        this.carouselTimer = null
      }
    },

    // 切换到下一个领养信息
    nextAdoption() {
      this.currentAdoptionIndex = (this.currentAdoptionIndex + 1) % this.latestAdoptions.length
    }
  }
}
</script>

<style scoped>
.cat-community {
  padding: 2rem 0;
}

/* 今日热门猫咪部分 */
.hot-cats-section {
  background-color: #ffd6e0;
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
}

.hot-cats-section h3 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.hot-cat-item {
  position: relative;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.hot-cat-item:hover {
  transform: translateY(-2px);
}

.hot-cat-item .cat-image {
  width: 100%;
  height: 120px;
  overflow: hidden;
  border-radius: 8px;
}

.hot-cat-item .cat-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hot-cat-item:hover .cat-image img {
  transform: scale(1.05);
}

.hot-cat-item .cat-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #fff;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #333;
}

/* 领养信息部分 */
.adoption-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.adoption-section h3 {
  color: #333;
  margin-bottom: 3rem;
  text-align: center;
}

.adoption-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.adoption-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.adoption-image:hover {
  transform: translateY(-2px);
}

.adoption-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.adoption-image:hover img {
  transform: scale(1.05);
}

.adoption-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.adoption-info .age {
  font-size: 0.9rem;
  color: #333;
}

.adoption-info .breed {
  font-size: 0.9rem;
  color: #333;
}

.adoption-info .requirements {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
}

/* 领养信息轮播 */
.adoption-carousel {
  position: relative;
  overflow: hidden;
}

.carousel-container {
  display: flex;
  transition: transform 0.5s ease;
  width: 100%;
}

.carousel-item {
  flex: 0 0 100%;
  width: 100%;
}

.adoption-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 3rem;
}

.adoption-dots .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.adoption-dots .dot:hover {
  transform: scale(1.2);
}

.adoption-dots .dot.active {
  background-color: #ffd6e0;
  transform: scale(1.2);
}

/* 社区话题部分 */
.community-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.community-section h3 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.topic-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.topic-tabs .tab {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #333;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.topic-tabs .tab:hover {
  background-color: #ffd6e0;
  transform: translateY(-1px);
}

.topic-tabs .tab.active {
  background-color: #ffd6e0;
  color: #333;
}

.topic-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.topic-item:hover {
  background-color: #f9f9f9;
  transform: translateX(5px);
}

.topic-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 8px;
}

.topic-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.topic-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.topic-title {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
}

.topic-price {
  font-size: 0.8rem;
  color: #ff6b6b;
}

/* 加载状态 */
.loading-state {
  padding: 2rem 0;
  text-align: center;
}

/* 错误状态 */
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

/* 空状态 */
.empty-state {
  padding: 2rem 0;
  text-align: center;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 1rem 0;
}

.empty-state p {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cat-community {
    padding: 1rem 0;
  }

  .hot-cats-section,
  .adoption-section,
  .community-section {
    margin-bottom: 2rem;
    padding: 1rem;
  }

  .hot-cat-item .cat-image {
    height: 100px;
  }

  .adoption-image {
    height: 150px;
  }

  .topic-item {
    flex-direction: column;
    text-align: center;
  }

  .topic-image {
    width: 100px;
    height: 100px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .topic-tabs {
    justify-content: center;
  }

  .topic-tabs .tab {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }
}
</style>