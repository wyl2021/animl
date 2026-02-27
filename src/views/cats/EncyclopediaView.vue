<template>
    <div class="encyclopedia-view">
        <!-- 搜索和添加按钮 -->
        <div class="top-actions">
            <div class="search-box">
                <el-input v-model="searchBreed" placeholder="按品种名搜索" clearable @input="handleSearch">
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
            </div>
            <el-button v-if="isAdmin" type="primary" @click="showAddModal = true">添加百科</el-button>
        </div>

        <!-- 百科列表 -->
        <div class="encyclopedia-container">
            <el-card v-for="item in encyclopedias" :key="item.id" class="encyclopedia-card">
                <!-- 卡片图片 -->
                <div class="card-image" v-if="item.images && item.images.length > 0">
                    <img :src="getImageUrl(item.images)" :alt="item.breed">
                </div>

                <!-- 卡片内容 -->
                <div class="card-content">
                    <!-- 粉色标签 -->
                    <div class="tag-label">品种介绍</div>

                    <!-- 品种名称 -->
                    <el-popover placement="right" :width="400" trigger="hover" :popper-class="'encyclopedia-popover'">
                        <template #reference>
                            <h3 class="card-title">{{ item.breed }}</h3>
                        </template>
                        <div class="popover-content">
                            <div class="popover-image" v-if="item.images && item.images.length > 0">
                                <img :src="getImageUrl(item.images)" :alt="item.breed">
                            </div>
                            <div class="popover-info">
                                <h4 class="popover-breed">{{ item.breed }}</h4>
                                <p class="popover-description" v-if="item.characteristics">
                                    {{ item.characteristics.substring(0, 100) }}{{ item.characteristics.length > 100 ?
                                        '...' :
                                        '' }}
                                </p>
                                <div class="popover-tips" v-if="item.care_guide">
                                    <div class="tip-item">
                                        <span class="tip-label">养护指南:</span>
                                        <span class="tip-content">{{ item.care_guide.substring(0, 50) }}{{
                                            item.care_guide.length > 50 ? '...' : '' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-popover>

                    <!-- 特征描述 -->
                    <p class="card-description" v-if="item.characteristics">
                        {{ item.characteristics.substring(0, 100) }}{{ item.characteristics.length > 100 ? '...' : '' }}
                    </p>

                    <!-- 品种信息 -->
                    <div class="card-info" v-if="item.scientific_name">
                        <div>品种: {{ item.scientific_name }}</div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="encyclopedia-actions" style="margin-top: 1rem; text-align: right;" v-if="isAdmin">
                        <el-dropdown>
                            <el-button size="small" type="primary" plain>
                                更多操作
                                <el-icon class="el-icon--right">
                                    <ArrowDown />
                                </el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click.stop="editEncyclopedia(item)">编辑</el-dropdown-item>
                                    <el-dropdown-item @click.stop="deleteEncyclopedia(item.id)"
                                        type="danger">删除</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 空状态 -->
        <div v-if="encyclopedias.length === 0" class="empty-state">
            <el-empty description="暂无猫咪百科数据" />
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
            <el-loading :fullscreen="true" text="加载中..." />
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="encyclopedias.length > 0">
            <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total"
                layout="prev, pager, next, jumper, ->, total" @current-change="fetchEncyclopedias" />
        </div>

        <!-- 添加/编辑弹窗 -->
        <el-dialog v-model="showAddModal" :title="editingItem ? '编辑猫咪百科' : '添加猫咪百科'" width="700px">
            <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
                <el-form-item label="学名" prop="scientific_name">
                    <el-input v-model="form.scientific_name" placeholder="请输入猫咪学名"></el-input>
                </el-form-item>
                <el-form-item label="品种名" prop="breed">
                    <el-input v-model="form.breed" placeholder="请输入品种名"></el-input>
                </el-form-item>
                <el-form-item label="特征">
                    <el-input v-model="form.characteristics" type="textarea" :rows="3" placeholder="请输入猫咪特征"></el-input>
                </el-form-item>
                <el-form-item label="习性">
                    <el-input v-model="form.habits" type="textarea" :rows="3" placeholder="请输入猫咪习性"></el-input>
                </el-form-item>
                <el-form-item label="养护指南">
                    <el-input v-model="form.care_guide" type="textarea" :rows="3" placeholder="请输入养护指南"></el-input>
                </el-form-item>
                <el-form-item label="行为解析">
                    <el-input v-model="form.behavior_analysis" type="textarea" :rows="3"
                        placeholder="请输入行为解析"></el-input>
                </el-form-item>
                <el-form-item label="趣味知识">
                    <el-input v-model="form.fun_facts" type="textarea" :rows="3" placeholder="请输入趣味知识"></el-input>
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload class="avatar-uploader" :show-file-list="false" :on-change="handleImageChange"
                        :before-upload="beforeUpload" :auto-upload="false" accept="image/*">
                        <img v-if="form.imagePreview" :src="form.imagePreview" class="avatar">
                        <img v-else-if="form.images" :src="form.images" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        <template #tip>
                            <div class="el-upload__tip">
                                支持上传一张图片
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>
                <el-form-item label="稀有度">
                    <el-select v-model="form.rarity" placeholder="请选择稀有度">
                        <el-option label="普通" value="普通"></el-option>
                        <el-option label="稀有" value="稀有"></el-option>
                        <el-option label="极稀有" value="极稀有"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showAddModal = false">取消</el-button>
                    <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 详情弹窗 -->
        <el-dialog v-model="showDetailModal" :title="currentEncyclopedia?.breed || '猫咪百科详情'" width="800px">
            <div v-if="currentEncyclopedia" class="encyclopedia-detail">
                <div class="detail-section">
                    <h3>基本信息</h3>
                    <div class="detail-row">
                        <span class="detail-label">学名：</span>
                        <span class="detail-value">{{ currentEncyclopedia.scientific_name }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">品种名：</span>
                        <span class="detail-value">{{ currentEncyclopedia.breed }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">稀有度：</span>
                        <el-tag :type="getRarityType(currentEncyclopedia.rarity)">{{ currentEncyclopedia.rarity
                        }}</el-tag>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>特征</h3>
                    <p>{{ currentEncyclopedia.characteristics }}</p>
                </div>

                <div class="detail-section">
                    <h3>习性</h3>
                    <p>{{ currentEncyclopedia.habits }}</p>
                </div>

                <div class="detail-section">
                    <h3>养护指南</h3>
                    <p>{{ currentEncyclopedia.care_guide }}</p>
                </div>

                <div class="detail-section">
                    <h3>行为解析</h3>
                    <p>{{ currentEncyclopedia.behavior_analysis }}</p>
                </div>

                <div class="detail-section">
                    <h3>趣味知识</h3>
                    <p>{{ currentEncyclopedia.fun_facts }}</p>
                </div>

                <div class="detail-section">
                    <h3>图片</h3>
                    <div class="detail-images"
                        v-if="currentEncyclopedia.images && currentEncyclopedia.images.length > 0">
                        <el-image v-for="(image, index) in currentEncyclopedia.images" :key="index"
                            :src="getImageUrl(image)" fit="cover" class="detail-image"
                            :preview-src-list="currentEncyclopedia.images.map(img => getImageUrl(img))"
                            preview-teleported :initial-index="index"></el-image>
                    </div>
                    <div v-else class="no-images">暂无图片</div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import { Search, More, ArrowDown, UploadFilled } from '@element-plus/icons-vue'
import catApi from '../../api/catApi'

export default {
    name: 'EncyclopediaView',
    data() {
        return {
            // 百科列表
            encyclopedias: [],
            // 加载状态
            loading: false,
            // 分页信息
            currentPage: 1,
            pageSize: 10,
            total: 0,
            // 搜索关键词
            searchBreed: '',
            // 添加/编辑弹窗
            showAddModal: false,
            showDetailModal: false,
            // 表单数据
            form: {
                scientific_name: '',
                breed: '',
                characteristics: '',
                habits: '',
                care_guide: '',
                behavior_analysis: '',
                fun_facts: '',
                images: '',
                imageFile: null,
                imagePreview: '',
                rarity: '普通'
            },
            // 图片文件列表
            imageFiles: [],
            // 图片预览
            imagePreview: '',
            // 表单验证规则
            rules: {
                scientific_name: [{ required: true, message: '请输入学名', trigger: 'blur' }],
                breed: [{ required: true, message: '请输入品种名', trigger: 'blur' }]
            },
            // 编辑状态
            editingItem: null,
            // 当前详情数据
            currentEncyclopedia: null,
            // 用户信息
            user: null
        }
    },
    mounted() {
        // 加载用户信息
        this.loadUserInfo()
        // 获取百科列表
        this.fetchEncyclopedias()
    },
    computed: {
        // 检查用户是否为管理员
        isAdmin() {
            return this.user?.role === 'admin'
        }
    },
    methods: {
        // 加载用户信息
        loadUserInfo() {
            const userInfo = localStorage.getItem('user')
            if (userInfo) {
                try {
                    this.user = JSON.parse(userInfo)
                } catch (error) {
                    console.error('解析用户信息失败:', error)
                }
            } else {
                console.log('本地存储中没有用户信息')
            }
        },
        // 获取百科列表
        async fetchEncyclopedias() {
            this.loading = true
            try {
                const data = await catApi.getEncyclopedias(this.currentPage, this.pageSize, this.searchBreed)
                console.log(data)
                this.encyclopedias = data.encyclopedias || []
                this.total = data.pagination?.total || 0
            } catch (error) {
                ElMessage.error('获取百科列表失败: ' + error.message)
                console.error('获取百科列表错误:', error)
            } finally {
                this.loading = false
            }
        },

        // 搜索处理
        handleSearch() {
            this.currentPage = 1
            this.fetchEncyclopedias()
        },

        // 查看详情
        viewDetail(item) {
            this.currentEncyclopedia = item
            this.showDetailModal = true
        },

        // 编辑百科
        editEncyclopedia(item) {
            this.editingItem = item
            this.form = {
                scientific_name: item.scientific_name,
                breed: item.breed,
                characteristics: item.characteristics,
                habits: item.habits,
                care_guide: item.care_guide,
                behavior_analysis: item.behavior_analysis,
                fun_facts: item.fun_facts,
                images: this.getImageUrl(item.images),
                imageFile: null,
                imagePreview: '',
                rarity: item.rarity
            }
            this.showAddModal = true
        },

        // 删除百科
        async deleteEncyclopedia(id) {
            try {
                const confirm = await this.$confirm('确定要删除这个百科条目吗？', '删除确认', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })

                if (confirm) {
                    await catApi.deleteEncyclopedia(id)
                    ElMessage.success('删除成功！')
                    this.fetchEncyclopedias()
                }
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('删除失败: ' + error.message)
                    console.error('删除百科错误:', error)
                }
            }
        },

        // 提交表单
        async submitForm() {
            try {
                await this.$refs.formRef.validate()

                this.submitting = true

                // 使用FormData来处理二进制数据
                const formData = new FormData()
                formData.append('scientific_name', this.form.scientific_name || '')
                formData.append('breed', this.form.breed || '')
                formData.append('characteristics', this.form.characteristics || '')
                formData.append('habits', this.form.habits || '')
                formData.append('care_guide', this.form.care_guide || '')
                formData.append('behavior_analysis', this.form.behavior_analysis || '')
                formData.append('fun_facts', this.form.fun_facts || '')
                formData.append('images', this.form.images || '')
                formData.append('rarity', this.form.rarity || '普通')

                // 添加图片文件（如果有）
                if (this.form.imageFile) {
                    formData.append('image', this.form.imageFile)
                }

                if (this.editingItem) {
                    // 更新操作：使用PUT /api/encyclopedias/:id端点
                    await catApi.updateEncyclopediaWithImage(this.editingItem.id, formData)
                    ElMessage.success('更新成功！')
                } else {
                    // 创建操作：使用POST /api/encyclopedias/image端点
                    await catApi.createEncyclopediaWithImage(formData)
                    ElMessage.success('添加成功！')
                }

                this.showAddModal = false
                this.resetForm()
                this.fetchEncyclopedias()
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('保存失败: ' + error.message)
                    console.error('保存百科错误:', error)
                }
            } finally {
                this.submitting = false
            }
        },

        // 重置表单
        resetForm() {
            this.form = {
                scientific_name: '',
                breed: '',
                characteristics: '',
                habits: '',
                care_guide: '',
                behavior_analysis: '',
                fun_facts: '',
                images: '',
                imageFile: null,
                imagePreview: '',
                rarity: '普通'
            }
            this.imageFiles = []
            this.editingItem = null
            if (this.$refs.formRef) {
                this.$refs.formRef.resetFields()
            }
        },

        // 处理图片上传
        handleImageChange(file) {
            if (file.raw) {
                // 保存文件对象
                this.form.imageFile = file.raw

                // 创建FileReader对象来读取文件，用于预览
                const reader = new FileReader()
                reader.onload = (e) => {
                    // 将图片转换为base64格式存储，仅用于预览
                    this.form.imagePreview = e.target.result
                }
                reader.readAsDataURL(file.raw)
            }
        },

        // 上传前校验
        beforeUpload(file) {
            const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!isJPG) {
                ElMessage.error('只能上传 JPG、PNG 或 GIF 格式的图片!')
            }
            if (!isLt2M) {
                ElMessage.error('图片大小不能超过 2MB!')
            }

            return isJPG && isLt2M
        },

        // 获取图片URL
        getImageUrl(image) {
            if (!image) return ''
            // 如果是完整URL或base64，直接返回
            if (image.startsWith('http') || image.startsWith('data:image')) {
                return image
            }
            // 否则拼接完整的上传路径
            return `http://localhost:3000/uploads/${image}`
        },

        // 获取稀有度标签类型
        getRarityType(rarity) {
            switch (rarity) {
                case '稀有':
                    return 'warning'
                case '极稀有':
                    return 'danger'
                default:
                    return 'success'
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

        // 获取提示内容
        getTooltipContent(item) {
            let content = `学名: ${item.scientific_name}\n`
            if (item.rarity) {
                content += `稀有度: ${item.rarity}\n`
            }
            if (item.characteristics) {
                content += `特征: ${item.characteristics.substring(0, 50)}${item.characteristics.length > 50 ? '...' : ''}`
            }
            return content
        },


    }
}
</script>

<style scoped>
.encyclopedia-view {
    padding: 2rem 0;
    width: 100%;
}



/* 顶部操作区 */
.top-actions {
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
}

.search-box {
    flex: 1;
    max-width: 400px;
}

/* 百科列表 */
.encyclopedia-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.encyclopedia-card {
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    border: none !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.encyclopedia-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
    transform: translateY(-5px);
}

/* 卡片图片样式 */
.card-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 16px 16px 0 0;
}

.card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.encyclopedia-card:hover .card-image img {
    transform: scale(1.05);
}

/* 卡片内容样式 */
.card-content {
    padding: 1.5rem;
}

/* 粉色标签样式 */
.tag-label {
    display: inline-block;
    background-color: #ff8fa3;
    color: white;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    margin-bottom: 1rem;
}

/* 卡片标题样式 */
.card-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
}

/* 卡片描述样式 */
.card-description {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #666;
    margin-bottom: 1rem;
}

/* 卡片信息样式 */
.card-info {
    font-size: 0.85rem;
    color: #999;
}

.encyclopedia-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.encyclopedia-breed {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
    color: #333;
}

.encyclopedia-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.encyclopedia-basic {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
}

.scientific-name,
.rarity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.label {
    font-weight: 500;
    color: #666;
}

.encyclopedia-characteristics {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.encyclopedia-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 0.5rem;
    position: relative;
}

.encyclopedia-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
}

.image-more {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    backdrop-filter: blur(2px);
}

/* 分页 */
.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 4rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 2rem;
}

/* 详情弹窗 */
.encyclopedia-detail {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.detail-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.detail-section h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 0.5rem;
}

.detail-row {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.detail-label {
    font-weight: 500;
    color: #666;
    min-width: 80px;
}

.detail-value {
    flex: 1;
    color: #333;
}

.detail-images {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.detail-image {
    width: 120px;
    height: 120px;
    border-radius: 8px;
}

.no-images {
    color: #999;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .top-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        max-width: none;
    }

    .encyclopedia-container {
        grid-template-columns: 1fr;
    }

    .encyclopedia-basic {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

/* 品种名称样式 */
.breed-container {
    position: relative;
    display: inline-block;
    cursor: pointer;
}

.encyclopedia-breed {
    transition: all 0.3s ease;
}

.encyclopedia-breed:hover {
    color: #e63946;
    text-decoration: underline;
}

/* Element UI Popover样式 */
.encyclopedia-popover {
    border-radius: 12px !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
    border: 1px solid #e0e0e0 !important;
    padding: 0 !important;
    max-width: 400px !important;
    min-width: 300px !important;
}

.popover-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
}

.popover-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
}

.popover-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.popover-breed {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.popover-description {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #666;
    margin: 0;
}

.popover-tips {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tip-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.tip-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tip-content {
    font-size: 0.9rem;
    line-height: 1.4;
    color: #666;
}

/* 上传组件样式 */
.avatar-uploader {
    width: 178px;
    height: 178px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader:hover {
    border-color: #409EFF;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar {
    width: 255px;
    height: 178px;
    display: block;
}
</style>