<template>
  <div class="adopt-view">
    <!-- <h2>猫咪领养</h2> -->
    <div class="action-bar">
      <!-- <el-button type="primary" @click="$router.push('/cats/add')">分享猫咪</el-button> -->
      <el-button type="info" @click="toggleMyAdoptions">{{ isAdmin ? '领养列表' : '我的领养' }}</el-button>
    </div>
    <!-- 我的领养表格 -->
    <div v-if="showMyAdoptions" class="my-adoptions-section">
      <div class="section-header">
        <div class="header-actions">
          <el-select v-model="selectedStatus" placeholder="选择状态" style="width: 120px; margin-right: 10px;"
            @change="fetchMyCats">
            <el-option v-for="option in statusOptions" :key="option.value" :label="option.label"
              :value="option.value" />
          </el-select>
          <el-button v-if="!isAdmin" type="primary" @click="showCreateCatModal = true">创建猫咪</el-button>
        </div>
      </div>
      <div v-if="loadingMyAdoptions" style="text-align: center; padding: 3rem;">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="errorMyAdoptions" class="error-state">
        <p>{{ errorMyAdoptions }}</p>
        <el-button @click="fetchMyCats">重试</el-button>
      </div>
      <div v-else>
        <el-table :data="myCats" style="width: 100%">
          <el-table-column prop="name" label="猫咪名称" width="180" />
          <el-table-column prop="breed" label="品种" width="120" />
          <el-table-column prop="age" label="年龄" width="80" />
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
          <el-table-column prop="created_at" label="发布时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="adoption_status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.adoption_status)">{{ getStatusText(scope.row.adoption_status)
                }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="rejection_reason" label="驳回理由" show-overflow-tooltip />

          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="goToCatDetail(scope.row.id)">详情</el-button>
              <template v-if="isAdmin">
                <template v-if="scope.row.status === 'approved'">
                  <el-button size="small" type="danger" @click="deleteCat(scope.row.id)">删除</el-button>
                </template>
                <template v-else>
                  <el-button size="small" type="success" @click="approveCat(scope.row.id)">通过</el-button>
                  <el-button size="small" type="danger" @click="rejectCat(scope.row.id)">驳回</el-button>
                </template>
              </template>
              <template v-else>
                <el-button size="small" type="primary" @click="editCat(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteCat(scope.row.id)">删除</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!myCats || myCats.length === 0" class="empty-state">
          <p>暂无领养信息</p>
        </div>
        <div class="pagination-wrapper">
          <el-pagination v-if="myTotalPages > 1" v-model:current-page="myCurrentPage" :page-size="myPageSize"
            :total="myTotalItems" layout="prev, pager, next, jumper" @current-change="fetchMyCats" />
        </div>
      </div>
    </div>
    <!-- 猫咪列表 -->
    <div v-else>
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
        <div v-if="!cats || cats.length === 0" class="empty-state">
          <p>暂无猫咪信息</p>
          <el-button type="primary" @click="$router.push('/cats/add')">分享第一只猫咪</el-button>
        </div>
        <div class="pagination-wrapper">
          <el-pagination v-if="totalPages > 1" v-model:current-page="currentPage" :page-size="pageSize"
            :total="totalItems" layout="prev, pager, next, jumper" @current-change="fetchCats" />
        </div>
      </div>
    </div>

    <!-- 创建猫咪弹窗 -->
    <el-dialog title="创建猫咪" v-model="showCreateCatModal" width="500px">
      <el-form :model="catForm" :rules="catFormRules" ref="catFormRef" label-width="80px">
        <el-form-item label="猫咪名字" prop="name">
          <el-input v-model="catForm.name" placeholder="请输入猫咪名字" />
        </el-form-item>
        <el-form-item label="品种" prop="breed">
          <el-input v-model="catForm.breed" placeholder="请输入品种" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input type="number" v-model="catForm.age" placeholder="请输入年龄" />
        </el-form-item>
        <el-form-item label="年龄显示" prop="age_display">
          <el-input v-model="catForm.age_display" placeholder="如：2岁" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="catForm.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="领养要求" prop="adoption_requirements">
          <el-input type="textarea" v-model="catForm.adoption_requirements" placeholder="请输入领养要求" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload class="avatar-uploader" :show-file-list="false" :on-change="handleImageUpload"
            :before-upload="beforeUpload" :auto-upload="false" accept="image/*">
            <img v-if="catForm.imagePreview" :src="catForm.imagePreview" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateCatModal = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitCreateCat">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑猫咪弹窗 -->
    <el-dialog title="编辑猫咪" v-model="showEditCatModal" width="500px">
      <el-form :model="catForm" :rules="catFormRules" ref="catFormRef" label-width="80px">
        <el-form-item label="猫咪名字" prop="name">
          <el-input v-model="catForm.name" placeholder="请输入猫咪名字" />
        </el-form-item>
        <el-form-item label="品种" prop="breed">
          <el-input v-model="catForm.breed" placeholder="请输入品种" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input type="number" v-model="catForm.age" placeholder="请输入年龄" />
        </el-form-item>
        <el-form-item label="年龄显示" prop="age_display">
          <el-input v-model="catForm.age_display" placeholder="如：2岁" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="catForm.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="领养状态">
          <el-input v-model="catForm.adoption_status" placeholder="请输入领养状态" />
        </el-form-item>
        <el-form-item label="领养要求" prop="adoption_requirements">
          <el-input type="textarea" v-model="catForm.adoption_requirements" placeholder="请输入领养要求" />
        </el-form-item>
        <el-form-item label="领养日期">
          <el-date-picker v-model="catForm.adoption_date" type="date" placeholder="选择领养日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否热门">
          <el-switch v-model="catForm.is_hot" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload class="avatar-uploader" :show-file-list="false" :on-change="handleImageUpload"
            :before-upload="beforeUpload" :auto-upload="false" accept="image/*">
            <img v-if="catForm.imagePreview" :src="catForm.imagePreview" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditCatModal = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitEditCat">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
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
      loadingImages: [],
      // 用户信息
      user: null,
      // 我的领养相关
      showMyAdoptions: false,
      myCats: [],
      loadingMyAdoptions: false,
      errorMyAdoptions: '',
      myCurrentPage: 1,
      myPageSize: 8,
      myTotalPages: 1,
      myTotalItems: 0,
      // 状态过滤
      selectedStatus: '',
      statusOptions: [
        { label: '全部', value: '' },
        { label: '待审核', value: 'pending' },
        { label: '已通过', value: 'approved' },
        { label: '已拒绝', value: 'rejected' }
      ],
      // 创建猫咪相关
      showCreateCatModal: false,
      showEditCatModal: false,
      editingCatId: null,
      catForm: {
        name: '',
        breed: '',
        age: 0,
        age_display: '',
        description: '',
        adoption_status: '',
        adoption_requirements: '',
        adoption_date: '',
        is_hot: false,
        image: '',
        imagePreview: null,
        imageFile: null
      },
      catFormRules: {
        name: [{ required: true, message: '请输入猫咪名字', trigger: 'blur' }],
        breed: [{ required: true, message: '请输入品种', trigger: 'blur' }],
        age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
        age_display: [{ required: true, message: '请输入年龄显示', trigger: 'blur' }],
        description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
        adoption_requirements: [{ required: true, message: '请输入领养要求', trigger: 'blur' }]
      },
      submitting: false
    }
  },
  computed: {
    // 判断用户是否为管理员
    isAdmin() {
      return this.user?.role === 'admin';
    }
  },
  mounted() {
    // 加载用户信息
    this.loadUserInfo();
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
    // 加载用户信息
    loadUserInfo() {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          this.user = JSON.parse(userInfo);
        } catch (error) {
          console.error('解析用户信息失败:', error);
        }
      }
    },
    // 获取状态类型
    getStatusType(status) {
      switch (status) {
        case 'approved':
          return 'success';
        case 'rejected':
          return 'danger';
        case 'pending':
          return 'warning';
        default:
          return '';
      }
    },
    // 获取状态文本
    getStatusText(status) {
      switch (status) {
        case 'approved':
          return '已通过';
        case 'rejected':
          return '已拒绝';
        case 'pending':
          return '待审核';
        default:
          return '';
      }
    },

    // 切换我的领养视图
    toggleMyAdoptions() {
      this.showMyAdoptions = !this.showMyAdoptions
      if (this.showMyAdoptions) {
        this.fetchMyCats()
      }
    },
    // 获取用户发布的猫咪
    async fetchMyCats() {
      try {
        this.loadingMyAdoptions = true
        this.errorMyAdoptions = ''
        // 无论用户角色，都使用/api/cats/my接口获取领养列表
        const response = await catApi.getMyCats(this.myCurrentPage, this.myPageSize, this.selectedStatus)
        console.log('获取领养列表响应:', response)
        this.myCats = response.data || response.items || []
        this.myTotalItems = response.total || 0
        this.myTotalPages = response.totalPages || 1
      } catch (error) {
        console.error('获取领养列表失败:', error)
        this.errorMyAdoptions = '获取领养列表失败'
        ElMessage.error('获取领养列表失败')
      } finally {
        this.loadingMyAdoptions = false
      }
    },
    // 处理图片上传
    handleImageUpload(file) {
      if (file.raw) {
        // 保存文件对象
        this.catForm.imageFile = file.raw;

        // 创建FileReader对象来读取文件，用于预览
        const reader = new FileReader();
        reader.onload = (e) => {
          // 将图片转换为base64格式存储，仅用于预览
          this.catForm.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file.raw);
      }
    },
    // 上传前校验
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        ElMessage.error('只能上传 JPG、PNG 或 GIF 格式的图片!');
      }
      if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!');
      }

      return isJPG && isLt2M;
    },
    // 提交创建猫咪表单
    async submitCreateCat() {
      try {
        await this.$refs.catFormRef.validate();

        this.submitting = true;

        // 创建FormData对象
        const formData = new FormData();

        // 添加文本字段
        formData.append('name', this.catForm.name);
        formData.append('breed', this.catForm.breed);
        formData.append('age', this.catForm.age);
        formData.append('age_display', this.catForm.age_display);
        formData.append('description', this.catForm.description);
        formData.append('adoption_requirements', this.catForm.adoption_requirements);

        // 添加图片文件（如果有）
        if (this.catForm.imageFile) {
          formData.append('image', this.catForm.imageFile);
        }

        // 调用API创建猫咪
        await catApi.createCat(formData);

        ElMessage.success('创建猫咪成功！');
        this.showCreateCatModal = false;

        // 重置表单
        this.resetCatForm();

        // 重新获取我的领养列表
        this.fetchMyCats();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('创建猫咪失败: ' + error.message);
          console.error('创建猫咪错误:', error);
        }
      } finally {
        this.submitting = false;
      }
    },
    // 编辑猫咪
    editCat(cat) {
      this.editingCatId = cat.id;
      // 填充表单数据
      this.catForm = {
        name: cat.name,
        breed: cat.breed,
        age: cat.age,
        age_display: cat.age_display,
        description: cat.description,
        adoption_status: cat.adoption_status || '',
        adoption_requirements: cat.adoption_requirements || '',
        adoption_date: cat.adoption_date || '',
        is_hot: cat.is_hot || false,
        image: cat.image || '',
        imagePreview: cat.image ? this.getImageUrl(cat.image) : null,
        imageFile: null
      };
      this.showEditCatModal = true;
    },
    // 删除猫咪
    async deleteCat(catId) {
      try {
        await ElMessageBox.confirm('确定要删除这只猫咪吗？', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        await catApi.deleteCat(catId);
        ElMessage.success('删除成功！');
        // 重新获取我的领养列表
        this.fetchMyCats();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败: ' + error.message);
          console.error('删除猫咪错误:', error);
        }
      }
    },
    // 提交编辑猫咪表单
    async submitEditCat() {
      try {
        await this.$refs.catFormRef.validate();

        this.submitting = true;

        // 创建FormData对象
        const formData = new FormData();

        // 添加文本字段
        formData.append('name', this.catForm.name);
        formData.append('breed', this.catForm.breed);
        formData.append('age', this.catForm.age);
        formData.append('age_display', this.catForm.age_display);
        formData.append('description', this.catForm.description);
        formData.append('adoption_status', this.catForm.adoption_status);
        formData.append('adoption_requirements', this.catForm.adoption_requirements);
        formData.append('adoption_date', this.catForm.adoption_date);
        formData.append('is_hot', this.catForm.is_hot);

        // 添加图片文件（如果有）
        if (this.catForm.imageFile) {
          formData.append('image', this.catForm.imageFile);
        }

        // 调用API更新猫咪
        await catApi.updateCat(this.editingCatId, formData);

        ElMessage.success('更新猫咪成功！');
        this.showEditCatModal = false;

        // 重置表单
        this.resetCatForm();

        // 重新获取我的领养列表
        this.fetchMyCats();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('更新猫咪失败: ' + error.message);
          console.error('更新猫咪错误:', error);
        }
      } finally {
        this.submitting = false;
      }
    },
    // 重置猫咪表单
    resetCatForm() {
      this.editingCatId = null;
      this.catForm = {
        name: '',
        breed: '',
        age: 0,
        age_display: '',
        description: '',
        adoption_status: '',
        adoption_requirements: '',
        adoption_date: '',
        is_hot: false,
        image: '',
        imagePreview: null,
        imageFile: null
      };
      if (this.$refs.catFormRef) {
        this.$refs.catFormRef.resetFields();
      }
    },
    // 获取图片URL
    getImageUrl(image) {
      if (!image) return '';
      // 如果是完整URL或base64，直接返回
      if (image.startsWith('http') || image.startsWith('data:image')) {
        return image;
      }
      // 否则拼接上传路径
      return `http://localhost:3000/uploads/${image}`;
    },
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
    // 通过猫咪领养申请
    async approveCat(catId) {
      try {
        await ElMessageBox.confirm('确定要通过这只猫咪的领养申请吗？', '通过确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        });

        await catApi.updateCatStatus(catId, 'approved');
        ElMessage.success('通过成功！');
        // 重新获取领养列表
        this.fetchMyCats();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('通过失败: ' + error.message);
          console.error('通过猫咪错误:', error);
        }
      }
    },
    // 驳回猫咪领养申请
    async rejectCat(catId) {
      try {
        const { value: rejectionReason } = await ElMessageBox.prompt(
          '请输入驳回理由:',
          '驳回确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            inputPlaceholder: '请输入驳回理由',
            inputValidator: (value) => {
              if (!value || value.trim() === '') {
                return '请输入驳回理由';
              }
            }
          }
        );

        await catApi.updateCatStatus(catId, 'rejected', rejectionReason);
        ElMessage.success('驳回成功！');
        // 重新获取领养列表
        this.fetchMyCats();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('驳回失败: ' + error.message);
          console.error('驳回猫咪错误:', error);
        }
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