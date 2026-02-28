<template>
    <div class="interact-view">
        <!-- 操作按钮 -->
        <div class="action-bar">
            <el-button type="primary" class="create-post-btn" @click="showCreatePostModal = true">发布帖子</el-button>
            <el-button type="info" @click="toggleMyInteractions">我的互动</el-button>
        </div>

        <!-- 我的互动表格 -->
        <div v-if="showMyInteractions" class="my-interactions-section">
            <div class="section-header">
                <div class="header-actions">
                    <el-select v-model="selectedStatus" placeholder="选择状态" style="width: 120px; margin-right: 10px;"
                        @change="fetchMyPosts">
                        <el-option v-for="option in statusOptions" :key="option.value" :label="option.label"
                            :value="option.value" />
                    </el-select>
                </div>
            </div>
            <div v-if="loadingMyPosts" style="text-align: center; padding: 3rem;">
                <el-skeleton :rows="3" animated />
            </div>
            <div v-else-if="errorMyPosts" class="error-state">
                <p>{{ errorMyPosts }}</p>
                <el-button @click="fetchMyPosts">重试</el-button>
            </div>
            <div v-else>
                <el-table :data="myPosts" style="width: 100%">
                    <el-table-column prop="title" label="帖子标题" show-overflow-tooltip />
                    <el-table-column prop="content" label="内容" show-overflow-tooltip />
                    <el-table-column prop="created_at" label="发布时间" width="180">
                        <template #default="scope">
                            {{ formatDate(scope.row.created_at) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="likes_count" label="点赞数" width="100" />
                    <el-table-column prop="comments_count" label="评论数" width="100" />
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="scope">
                            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status)
                                }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="rejection_reason" label="驳回理由" show-overflow-tooltip />
                    <el-table-column label="操作" width="200">
                        <template #default="scope">
                            <el-button size="small" @click="goToPostDetail(scope.row)">详情</el-button>
                            <template v-if="isAdmin">
                                <template v-if="scope.row.status === 'approved'">
                                    <el-button size="small" type="danger"
                                        @click="deletePost(scope.row.id)">删除</el-button>
                                </template>
                                <template v-else>
                                    <el-button size="small" type="success"
                                        @click="approvePost(scope.row.id)">通过</el-button>
                                    <el-button size="small" type="danger"
                                        @click="rejectPost(scope.row.id)">驳回</el-button>
                                </template>
                            </template>
                            <template v-else>
                                <el-button size="small" type="primary" @click="editPost(scope.row)">编辑</el-button>
                                <el-button size="small" type="danger" @click="deletePost(scope.row.id)">删除</el-button>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>
                <div v-if="!myPosts || myPosts.length === 0" class="empty-state">
                    <p>暂无互动信息</p>
                </div>
                <div class="pagination-wrapper">
                    <el-pagination v-if="myTotalPages > 1" v-model:current-page="myCurrentPage" :page-size="myPageSize"
                        :total="myTotalItems" layout="prev, pager, next, jumper" @current-change="fetchMyPosts" />
                </div>
            </div>
        </div>

        <!-- 帖子列表 -->
        <div v-else class="posts-container">
            <el-card v-for="post in posts" :key="post.id" class="post-card" @click="goToPostDetail(post)">
                <el-card-header>
                    <div class="post-header">
                        <div class="user-info">
                            <el-avatar :size="40" :src="post.user_avatar || ''" :alt="post.user_name">
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
                                        <el-dropdown-item @click.stop="editPost(post)">编辑</el-dropdown-item>
                                        <el-dropdown-item @click.stop="deletePost(post.id)"
                                            type="danger">删除</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>
                </el-card-header>
                <el-card-body>
                    <h3 class="post-title">{{ post.title }}</h3>
                    <p class="post-content">{{ post.content }}</p>

                    <!-- 帖子图片 -->
                    <div v-if="post.images && post.images.length > 0" class="post-images"
                        :class="getImageLayoutClass(post.images.length)">
                        <el-image v-for="(image, index) in post.images.slice(0, 9)" :key="index"
                            :src="getImageUrl(image)" fit="cover" class="post-image"
                            :preview-src-list="post.images.slice(0, 9).map(img => getImageUrl(img))" preview-teleported
                            show-toolbar :initial-index="index"></el-image>
                        <div v-if="post.images.length > 9" class="image-more">
                            +{{ post.images.length - 9 }}
                        </div>
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
                                <el-button size="small" :type="post.isLiked ? 'danger' : 'default'"
                                    @click.stop="likePost(post)">
                                    <el-icon>
                                        <Star />
                                    </el-icon>
                                    {{ post.isLiked ? '已点赞' : '点赞' }} {{ post.likes_count || 0 }}
                                </el-button>
                            </span>
                            <span class="stat-item">
                                <el-button size="small" @click.stop="goToPostDetail(post)">
                                    <el-icon>
                                        <ChatDotRound />
                                    </el-icon>
                                    评论 {{ post.comments_count || 0 }}
                                </el-button>
                            </span>
                        </div>
                    </div>
                </el-card-body>
            </el-card>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
            <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="totalPosts"
                layout="prev, pager, next, jumper, ->, total" @current-change="fetchPosts" />
        </div>

        <!-- 发布帖子弹窗 -->
        <el-dialog v-model="showCreatePostModal" title="发布帖子" width="600px">
            <el-form :model="postForm" label-width="80px">
                <el-form-item label="猫咪">
                    <el-select v-model="postForm.cat_id" placeholder="选择猫咪">
                        <el-option v-for="cat in cats" :key="cat.id" :label="cat.name" :value="cat.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="标题">
                    <el-input v-model="postForm.title" placeholder="请输入帖子标题"></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="postForm.content" type="textarea" :rows="4" placeholder="请输入帖子内容"></el-input>
                </el-form-item>
                <el-form-item label="图片">
                    <el-upload class="post-uploader" :action="''" :multiple="true" :show-file-list="true"
                        :on-change="handleImageUpload" :before-upload="beforeUpload" :auto-upload="false"
                        accept="image/*">
                        <el-button type="primary">选择图片</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="视频">
                    <el-upload class="post-uploader" :action="''" :multiple="false" :show-file-list="true"
                        :on-change="handleVideoUpload" :before-upload="beforeUploadVideo" :auto-upload="false"
                        accept="video/*">
                        <el-button type="primary">选择视频</el-button>
                    </el-upload>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showCreatePostModal = false">取消</el-button>
                    <el-button type="primary" @click="createPost" :loading="submitting">发布</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- 评论弹窗 -->
        <el-dialog v-model="showCommentsModal" :title="`评论 - ${currentPost?.title || ''}`" width="600px">
            <!-- 评论输入 -->
            <el-form :model="commentForm" label-width="0">
                <el-form-item>
                    <el-input v-model="commentForm.content" type="textarea" :rows="3"
                        placeholder="写下你的评论..."></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitComment" :loading="submittingComment">发布评论</el-button>
                </el-form-item>
            </el-form>

            <!-- 评论列表 -->
            <div class="comments-list">
                <div v-for="comment in currentPostComments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                        <el-avatar :size="32" :src="comment.user_avatar || ''" :alt="comment.user_name">
                            {{ getAvatarText(comment.user_name) }}
                        </el-avatar>
                        <div class="comment-user-info">
                            <div class="comment-user-name">{{ comment.user_name }}</div>
                            <div class="comment-time">{{ formatDate(comment.created_at) }}</div>
                        </div>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                    <div class="comment-actions">
                        <el-button size="small" :type="comment.isLiked ? 'danger' : 'default'"
                            @click="likeComment(comment)">
                            <el-icon>
                                <Star />
                            </el-icon>
                            {{ comment.isLiked ? '已点赞' : '点赞' }} {{ comment.likes_count || 0 }}
                        </el-button>
                        <el-button size="small" @click="replyToComment(comment)">回复</el-button>
                    </div>
                </div>
                <div v-if="currentPostComments.length === 0" class="empty-comments">
                    暂无评论，快来抢沙发吧！
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star, ChatDotRound, More } from '@element-plus/icons-vue'
import catApi from '../../api/catApi'

export default {
    name: 'InteractView',
    data() {
        return {
            // 帖子相关
            posts: [],
            currentPage: 1,
            pageSize: 10,
            totalPosts: 0,
            showCreatePostModal: false,
            postForm: {
                cat_id: '',
                title: '',
                content: '',
                images: [],
                video: ''
            },
            submitting: false,

            // 评论相关
            showCommentsModal: false,
            currentPost: null,
            currentPostComments: [],
            commentForm: {
                content: '',
                parent_id: null
            },
            submittingComment: false,

            // 猫咪列表
            cats: [],

            // 加载状态
            loading: false,
            // 我的互动相关
            showMyInteractions: false,
            myPosts: [],
            loadingMyPosts: false,
            errorMyPosts: '',
            myCurrentPage: 1,
            myPageSize: 10,
            myTotalPages: 1,
            myTotalItems: 0,
            // 用户信息
            user: null,
            // 状态过滤
            selectedStatus: '',
            statusOptions: [
                { label: '全部', value: '' },
                { label: '待审核', value: 'pending' },
                { label: '已通过', value: 'approved' },
                { label: '已拒绝', value: 'rejected' }
            ]
        }
    },
    computed: {
        // 为了保持模板兼容性
        totalItems() {
            return this.totalPosts
        },
        // 判断用户是否为管理员
        isAdmin() {
            return this.user?.role === 'admin';
        }
    },
    mounted() {
        // 加载用户信息
        this.loadUserInfo();
        this.fetchPosts()
        this.fetchCats()
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
        // 切换我的互动视图
        toggleMyInteractions() {
            this.showMyInteractions = !this.showMyInteractions
            if (this.showMyInteractions) {
                this.fetchMyPosts()
            }
        },
        // 获取用户发布的帖子
        async fetchMyPosts() {
            try {
                this.loadingMyPosts = true
                this.errorMyPosts = ''
                const response = await catApi.getMyPosts(this.myCurrentPage, this.myPageSize, this.selectedStatus)
                this.myPosts = response.posts
                this.myTotalItems = response.pagination.total
                this.myTotalPages = response.pagination.totalPages
            } catch (error) {
                console.error('获取我的互动失败:', error)
                this.errorMyPosts = '获取我的互动失败'
                ElMessage.error('获取我的互动失败')
            } finally {
                this.loadingMyPosts = false
            }
        },
        // 获取帖子列表
        async fetchPosts() {
            this.loading = true
            try {
                const token = localStorage.getItem('token')
                // 添加分页参数
                const url = `http://localhost:3000/api/posts?page=${this.currentPage}&limit=${this.pageSize}`
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('获取帖子列表失败')
                }

                const postsData = await response.json()
                this.posts = postsData.posts || []
                this.totalPosts = postsData.pagination?.total || 0
            } catch (error) {
                ElMessage.error('获取帖子列表失败: ' + error.message)
                console.error('获取帖子列表错误:', error)
            } finally {
                this.loading = false
            }
        },

        // 获取猫咪列表
        async fetchCats() {
            try {
                const token = localStorage.getItem('token')
                const response = await fetch('http://localhost:3000/api/cats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('获取猫咪列表失败')
                }

                const catsData = await response.json()
                this.cats = catsData.data || catsData
            } catch (error) {
                ElMessage.error('获取猫咪列表失败: ' + error.message)
                console.error('获取猫咪列表错误:', error)
            }
        },

        // 发布帖子
        async createPost() {
            if (!this.postForm.cat_id || !this.postForm.title || !this.postForm.content) {
                ElMessage.error('请填写完整的帖子信息')
                return
            }

            this.submitting = true
            try {
                const token = localStorage.getItem('token')
                const formData = new FormData()

                formData.append('user_id', this.getUserId())
                formData.append('cat_id', this.postForm.cat_id)
                formData.append('title', this.postForm.title)
                formData.append('content', this.postForm.content)

                // 添加图片
                if (this.postForm.images && this.postForm.images.length > 0) {
                    this.postForm.images.forEach((image, index) => {
                        formData.append(`images[${index}]`, image)
                    })
                }

                // 添加视频
                if (this.postForm.video) {
                    formData.append('video', this.postForm.video)
                }

                const response = await fetch('http://localhost:3000/api/posts', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                })

                if (!response.ok) {
                    throw new Error('发布帖子失败')
                }

                const newPost = await response.json()
                this.posts.unshift(newPost)
                this.totalPosts++
                this.showCreatePostModal = false
                this.resetPostForm()
                ElMessage.success('帖子发布成功！')
            } catch (error) {
                ElMessage.error('发布帖子失败: ' + error.message)
                console.error('发布帖子错误:', error)
            } finally {
                this.submitting = false
            }
        },

        // 点赞帖子
        async likePost(post) {
            try {
                const token = localStorage.getItem('token')
                const url = post.isLiked
                    ? 'http://localhost:3000/api/likes'
                    : 'http://localhost:3000/api/likes'

                const method = post.isLiked ? 'DELETE' : 'POST'

                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: this.getUserId(),
                        post_id: post.id
                    })
                })

                if (!response.ok) {
                    throw new Error(post.isLiked ? '取消点赞失败' : '点赞失败')
                }

                post.isLiked = !post.isLiked
                post.likes_count = (post.likes_count || 0) + (post.isLiked ? 1 : -1)
                ElMessage.success(post.isLiked ? '点赞成功！' : '取消点赞成功！')
            } catch (error) {
                ElMessage.error(error.message)
                console.error('点赞操作错误:', error)
            }
        },

        // 显示帖子评论
        async showPostComments(post) {
            this.currentPost = post
            this.showCommentsModal = true
            await this.fetchPostComments(post.id)
        },

        // 获取帖子评论
        async fetchPostComments(postId) {
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

                this.currentPostComments = await response.json()
            } catch (error) {
                ElMessage.error('获取评论失败: ' + error.message)
                console.error('获取评论错误:', error)
            }
        },

        // 提交评论
        async submitComment() {
            if (!this.commentForm.content || !this.currentPost) {
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
                        post_id: this.currentPost.id,
                        content: this.commentForm.content,
                        parent_id: this.commentForm.parent_id
                    })
                })

                if (!response.ok) {
                    throw new Error('发布评论失败')
                }

                const newComment = await response.json()
                this.currentPostComments.unshift(newComment)
                this.currentPost.comments_count = (this.currentPost.comments_count || 0) + 1
                this.commentForm.content = ''
                this.commentForm.parent_id = null
                ElMessage.success('评论发布成功！')
            } catch (error) {
                ElMessage.error('发布评论失败: ' + error.message)
                console.error('发布评论错误:', error)
            } finally {
                this.submittingComment = false
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
            // 可以添加回复提示
            ElMessage.info(`回复: ${comment.user_name}`)
        },

        // 处理图片上传
        handleImageUpload(file) {
            if (!this.postForm.images) {
                this.postForm.images = []
            }
            this.postForm.images.push(file.raw)
        },

        // 处理视频上传
        handleVideoUpload(file) {
            this.postForm.video = file.raw
        },

        // 上传前校验
        beforeUpload(file) {
            const isImage = file.type.startsWith('image/')
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!isImage) {
                ElMessage.error('只能上传图片文件！')
                return false
            }
            if (!isLt2M) {
                ElMessage.error('图片大小不能超过 2MB！')
                return false
            }
            return true
        },

        // 视频上传前校验
        beforeUploadVideo(file) {
            const isVideo = file.type.startsWith('video/')
            const isLt50M = file.size / 1024 / 1024 < 50

            if (!isVideo) {
                ElMessage.error('只能上传视频文件！')
                return false
            }
            if (!isLt50M) {
                ElMessage.error('视频大小不能超过 50MB！')
                return false
            }
            return true
        },

        // 重置帖子表单
        resetPostForm() {
            this.postForm = {
                cat_id: '',
                title: '',
                content: '',
                images: [],
                video: ''
            }
        },

        // 获取用户ID
        getUserId() {
            // 从localStorage获取用户信息
            const userStr = localStorage.getItem('user')
            try {
                const user = JSON.parse(userStr)
                return user.id || 2 // 默认用户ID
            } catch {
                return 2 // 默认用户ID
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
        },

        // 跳转到帖子详情页
        goToPostDetail(post) {
            // 这里需要根据实际的路由配置修改
            // 假设帖子详情页路由为 /posts/:id
            this.$router.push(`/posts/${post.id}`)
        },
        // 编辑帖子
        editPost(post) {
            // 这里可以添加编辑帖子的逻辑
            // 例如打开编辑弹窗，填充表单数据等
            ElMessage.info('编辑帖子功能待实现')
        },
        // 删除帖子
        async deletePost(postId) {
            try {
                await ElMessageBox.confirm('确定要删除这篇帖子吗？', '删除确认', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                // 调用API删除帖子
                await catApi.deletePost(postId);
                ElMessage.success('删除成功！');
                // 重新获取我的互动列表
                this.fetchMyPosts();
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('删除失败: ' + error.message);
                    console.error('删除帖子错误:', error);
                }
            }
        },
        // 通过帖子审核
        async approvePost(postId) {
            try {
                await ElMessageBox.confirm('确定要通过这篇帖子吗？', '通过确认', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'success'
                });

                // 调用API更新帖子状态
                await catApi.updatePostStatus(postId, 'approved');
                ElMessage.success('通过成功！');
                // 重新获取我的互动列表
                this.fetchMyPosts();
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('通过失败: ' + error.message);
                    console.error('通过帖子错误:', error);
                }
            }
        },
        // 驳回帖子审核
        async rejectPost(postId) {
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

                // 调用API更新帖子状态
                await catApi.updatePostStatus(postId, 'rejected', rejectionReason);
                ElMessage.success('驳回成功！');
                // 重新获取我的互动列表
                this.fetchMyPosts();
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('驳回失败: ' + error.message);
                    console.error('驳回帖子错误:', error);
                }
            }
        }
    }
}
</script>

<style scoped>
.interact-view {
    padding: 2rem 0;
    width: 80%;
    margin: 0 auto;
}

h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #333;
    text-align: center;
}

.create-post-btn {
    /* margin-bottom: 2rem; */
}

.action-bar {
    margin-bottom: 2rem;
}

.posts-container {
    margin-bottom: 2rem;
    width: 100%;
    /* display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem; */
}

.post-card {
    margin-bottom: 1.5rem;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
}

.post-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
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
    gap: 12px;
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
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0 0 1rem 0;
    color: #333;
}

.post-content {
    margin: 0 0 1rem 0;
    color: #666;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.post-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 1rem 0;
    position: relative;
    max-width: 100%;
}

/* 图片布局样式 */
.image-layout-1 {
    max-width: 400px;
}

.image-layout-1 .post-image {
    width: 100%;
    height: 300px;
}

.image-layout-2 .post-image {
    width: calc(50% - 4px);
    height: 200px;
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
    height: 150px;
}

.image-layout-multi {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 8px;
}

.image-layout-multi .post-image {
    width: 100%;
    height: 120px;
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

/* 更多图片提示 */
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

/* 响应式调整 */
@media (max-width: 768px) {
    .image-layout-1 .post-image {
        height: 200px;
    }

    .image-layout-2 .post-image {
        height: 150px;
    }

    .image-layout-4 .post-image {
        height: 120px;
    }

    .image-layout-multi .post-image {
        height: 100px;
    }
}

.post-video {
    margin: 1rem 0;
}

.video-player {
    width: 100%;
    max-height: 300px;
    border-radius: 8px;
}

.post-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
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

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
}

.comments-list {
    margin-top: 2rem;
}

.comment-item {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 0.5rem;
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
    margin-bottom: 0.5rem;
    color: #666;
    line-height: 1.5;
}

.comment-actions {
    display: flex;
    gap: 12px;
}

.empty-comments {
    text-align: center;
    padding: 2rem;
    color: #999;
}

@media (max-width: 768px) {
    .interact-view {
        padding: 1rem 0;
    }

    h2 {
        font-size: 1.5rem;
    }

    .post-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .post-stats {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .stats {
        width: 100%;
        justify-content: space-between;
    }
}
</style>