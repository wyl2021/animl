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
            <button @click="likeCat" class="action-btn like-btn" :class="{ 'liked': cat.isLiked, 'loading': liking }">
              <span class="icon">{{ cat.isLiked ? '❤️' : '🤍' }}</span>
              <span>{{ cat.likes || 0 }}</span>
              <span class="action-text">{{ cat.isLiked ? '已点赞' : '点赞' }}</span>
            </button>
            <button class="action-btn share-btn">
              <span class="icon">📤</span>
              <span class="action-text">分享</span>
            </button>
            <button @click="openEditModal" class="action-btn edit-btn">
              <span class="icon">✏️</span>
              <span class="action-text">编辑</span>
            </button>
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
                <span class="avatar">{{ getAvatarText(comment.user_name) }}</span>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.user_name }}</span>
                  <span class="comment-time">{{ formatDate(comment.created_at) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-actions">
                  <button @click="likeComment(comment.id)" class="comment-action-btn like-btn"
                    :class="{ 'liked': comment.isLiked, 'loading': likingComments.includes(comment.id) }">
                    <span class="icon">{{ comment.isLiked ? '❤️' : '🤍' }}</span>
                    <span>{{ comment.likes_count || 0 }}</span>
                  </button>
                  <button @click="replyToComment(comment)" class="comment-action-btn reply-btn">
                    <span class="icon">↩️</span>
                    <span>回复</span>
                  </button>
                  <button @click="editComment(comment)" class="comment-action-btn edit-btn">
                    <span class="icon">✏️</span>
                    <span>编辑</span>
                  </button>
                  <button @click="confirmDeleteComment(comment.id)" class="comment-action-btn delete-btn">
                    <span class="icon">🗑️</span>
                    <span>删除</span>
                  </button>
                </div>
                <div v-if="editingCommentId === comment.id" class="comment-edit-form">
                  <textarea v-model="editingCommentContent" placeholder="编辑你的评论..." rows="2"></textarea>
                  <div class="edit-actions">
                    <button @click="updateComment(comment.id)" class="btn btn-sm btn-primary"
                      :disabled="!editingCommentContent.trim()">
                      保存
                    </button>
                    <button @click="cancelEditComment" class="btn btn-sm btn-secondary">
                      取消
                    </button>
                  </div>
                </div>
                <div v-if="replyingToCommentId === comment.id" class="comment-reply-form">
                  <textarea v-model="replyContent" placeholder="写下你的回复..." rows="2"
                    :disabled="submittingReply"></textarea>
                  <div class="reply-actions">
                    <button @click="submitReply(comment.id)" class="btn btn-sm btn-primary"
                      :disabled="!replyContent.trim() || submittingReply">
                      {{ submittingReply ? '提交中...' : '回复' }}
                    </button>
                    <button @click="cancelReply" class="btn btn-sm btn-secondary">
                      取消
                    </button>
                  </div>
                </div>

                <!-- 显示回复评论 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
                  <!-- 回复评论列表 -->
                  <div v-for="reply in getVisibleReplies(comment)" :key="reply.id" class="comment-item reply-comment">
                    <div class="comment-avatar">
                      <span class="avatar">{{ getAvatarText(reply.user_name) }}</span>
                    </div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-user">{{ reply.user_name }}</span>
                        <span class="comment-time">{{ formatDate(reply.created_at) }}</span>
                      </div>
                      <p class="comment-text">{{ reply.content }}</p>
                      <div class="comment-actions">
                        <button @click="likeComment(reply.id)" class="comment-action-btn like-btn"
                          :class="{ 'liked': reply.isLiked, 'loading': likingComments.includes(reply.id) }">
                          <span class="icon">{{ reply.isLiked ? '❤️' : '🤍' }}</span>
                          <span>{{ reply.likes_count || 0 }}</span>
                        </button>
                        <button @click="replyToComment(reply)" class="comment-action-btn reply-btn">
                          <span class="icon">↩️</span>
                          <span>回复</span>
                        </button>
                        <button @click="editComment(reply)" class="comment-action-btn edit-btn">
                          <span class="icon">✏️</span>
                          <span>编辑</span>
                        </button>
                        <button @click="confirmDeleteComment(reply.id)" class="comment-action-btn delete-btn">
                          <span class="icon">🗑️</span>
                          <span>删除</span>
                        </button>
                      </div>
                      <div v-if="editingCommentId === reply.id" class="comment-edit-form">
                        <textarea v-model="editingCommentContent" placeholder="编辑你的评论..." rows="2"></textarea>
                        <div class="edit-actions">
                          <button @click="updateComment(reply.id)" class="btn btn-sm btn-primary"
                            :disabled="!editingCommentContent.trim()">
                            保存
                          </button>
                          <button @click="cancelEditComment" class="btn btn-sm btn-secondary">
                            取消
                          </button>
                        </div>
                      </div>
                      <div v-if="replyingToCommentId === reply.id" class="comment-reply-form">
                        <textarea v-model="replyContent" placeholder="写下你的回复..." rows="2"
                          :disabled="submittingReply"></textarea>
                        <div class="reply-actions">
                          <button @click="submitReply(reply.id)" class="btn btn-sm btn-primary"
                            :disabled="!replyContent.trim() || submittingReply">
                            {{ submittingReply ? '提交中...' : '回复' }}
                          </button>
                          <button @click="cancelReply" class="btn btn-sm btn-secondary">
                            取消
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 回复分页控制 -->
                  <div v-if="comment.replies.length > this.repliesPerPage" class="reply-pagination">
                    <button @click="showMoreReplies(comment.id)" v-if="!isExpanded(comment.id)"
                      class="comment-action-btn more-btn">
                      <span class="icon">📢</span>
                      <span>显示更多回复 ({{ comment.replies.length - this.repliesPerPage }} 条)</span>
                    </button>
                    <button @click="showLessReplies(comment.id)" v-else class="comment-action-btn more-btn">
                      <span class="icon">📢</span>
                      <span>收起回复</span>
                    </button>
                  </div>
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

  <!-- 编辑弹框 -->
  <el-dialog v-model="showEditModal" title="编辑猫咪信息" width="600px" @close="hideEditModal">
    <el-form :model="editForm" label-width="80px" @submit.prevent="saveCatChanges">
      <el-form-item label="猫咪名称">
        <el-input v-model="editForm.name" placeholder="请输入猫咪名称"></el-input>
      </el-form-item>
      <el-form-item label="品种">
        <el-input v-model="editForm.breed" placeholder="请输入猫咪品种"></el-input>
      </el-form-item>
      <el-form-item label="年龄">
        <el-input-number v-model="editForm.age" :min="0" :max="30" placeholder="请输入猫咪年龄"></el-input-number>
      </el-form-item>
      <el-form-item label="性别">
        <el-select v-model="editForm.gender" placeholder="请选择猫咪性别">
          <el-option label="公" value="公"></el-option>
          <el-option label="母" value="母"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="图片">
        <el-upload class="avatar-uploader" :show-file-list="false" :on-change="handleImageUpload"
          :before-upload="beforeUpload" :auto-upload="false" accept="image/*">
          <img v-if="editForm.imagePreview" :src="editForm.imagePreview" class="avatar">
          <img v-else-if="editForm.image" :src="getImageUrl(editForm.image)" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入猫咪描述"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="hideEditModal" :disabled="savingCat">取消</el-button>
        <el-button type="primary" @click="saveCatChanges" :loading="savingCat">
          {{ savingCat ? '保存中...' : '保存更改' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
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
      likingComments: [],
      editingCommentId: null,
      editingCommentContent: '',
      deletingCommentId: null,
      replyingToCommentId: null,
      replyContent: '',
      submittingReply: false,
      // 回复评论的展开状态
      expandedReplies: {},
      // 回复评论的分页状态
      replyPages: {},
      // 每页显示的回复数量
      repliesPerPage: 3,
      // 编辑弹框状态
      showEditModal: false,
      // 编辑表单数据
      editForm: {
        name: '',
        breed: '',
        age: 0,
        gender: '',
        image: '',
        imagePreview: null, // 用于存储base64预览
        imageFile: null, // 用于存储文件对象
        description: ''
      },
      // 保存状态
      savingCat: false
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
        console.log('获取到的评论数据:', commentsData);
        this.comments = this.buildCommentTree(commentsData);
      } catch (error) {
        console.error('获取评论失败:', error);
      } finally {
        this.loadingComments = false;
      }
    },

    // 构建评论树
    buildCommentTree(comments) {
      const commentMap = {};
      const rootComments = [];

      // 首先将所有评论放入映射中
      comments.forEach(comment => {
        comment.replies = [];
        commentMap[comment.id] = comment;
      });

      // 然后构建评论树
      comments.forEach(comment => {
        if (comment.parent_id) {
          // 这是一个回复评论
          if (commentMap[comment.parent_id]) {
            commentMap[comment.parent_id].replies.push(comment);
          }
        } else {
          // 这是一个顶级评论
          rootComments.push(comment);
        }
      });

      return rootComments;
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
        if (this.cat.isLiked) {
          // 取消点赞
          await catApi.unlikeCat(this.cat.id);
          this.cat.likes--;
        } else {
          // 点赞
          await catApi.likeCat(this.cat.id);
          this.cat.likes++;
        }
        this.cat.isLiked = !this.cat.isLiked;
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
        if (comment.isLiked) {
          await catApi.unlikeComment(commentId);
          comment.likes_count--;
        } else {
          await catApi.likeComment(commentId);
          comment.likes_count++;
        }
        comment.isLiked = !comment.isLiked;
      } catch (error) {
        console.error('评论点赞失败:', error);
      } finally {
        this.likingComments = this.likingComments.filter(id => id !== commentId);
      }
    },

    // 开始回复评论
    replyToComment(comment) {
      this.replyingToCommentId = comment.id;
      this.replyContent = '';
    },

    // 取消回复
    cancelReply() {
      this.replyingToCommentId = null;
      this.replyContent = '';
    },

    // 提交回复
    async submitReply(commentId) {
      if (!this.replyContent.trim() || this.submittingReply) return;

      try {
        this.submittingReply = true;
        const catId = parseInt(this.$route.params.id);
        const commentData = {
          content: this.replyContent.trim(),
          user: '当前用户' // 实际项目中应该从登录状态获取用户名
        };
        const newReply = await catApi.addComment(catId, commentData, commentId);

        // 查找父评论并添加回复
        const parentComment = this.findCommentById(this.comments, commentId);
        if (parentComment) {
          parentComment.replies.push(newReply);
        } else {
          // 如果找不到父评论，就添加到顶级评论
          this.comments.unshift(newReply);
        }

        // 更新猫咪的评论数
        if (this.cat) {
          this.cat.comments = (this.cat.comments || 0) + 1;
        }
        this.cancelReply();
      } catch (error) {
        console.error('回复评论失败:', error);
      } finally {
        this.submittingReply = false;
      }
    },

    // 根据ID查找评论（递归）
    findCommentById(comments, commentId) {
      for (const comment of comments) {
        if (comment.id === commentId) {
          return comment;
        }
        if (comment.replies && comment.replies.length > 0) {
          const found = this.findCommentById(comment.replies, commentId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },

    // 获取可见的回复评论
    getVisibleReplies(comment) {
      if (this.isExpanded(comment.id)) {
        return comment.replies;
      } else {
        // 默认只显示前3条回复
        return comment.replies.slice(0, this.repliesPerPage);
      }
    },

    // 判断回复是否展开
    isExpanded(commentId) {
      return this.expandedReplies[commentId] || false;
    },

    // 显示更多回复
    showMoreReplies(commentId) {
      this.expandedReplies[commentId] = true;
    },

    // 收起回复
    showLessReplies(commentId) {
      this.expandedReplies[commentId] = false;
    },

    // 切换回复展开状态
    toggleReplies(commentId) {
      this.expandedReplies[commentId] = !this.isExpanded(commentId);
    },

    // 显示编辑弹框
    openEditModal() {
      // 初始化编辑表单数据
      if (this.cat) {
        this.editForm = {
          name: this.cat.name || '',
          breed: this.cat.breed || '',
          age: this.cat.age || 0,
          gender: this.cat.gender || '公',
          image: this.cat.image || '',
          imagePreview: null, // 用于存储base64预览
          imageFile: null, // 用于存储文件对象
          description: this.cat.description || ''
        };
      }
      this.showEditModal = true;
    },

    // 隐藏编辑弹框
    hideEditModal() {
      this.showEditModal = false;
    },

    // 处理图片上传
    handleImageUpload(file) {
      if (file.raw) {
        // 保存文件对象
        this.editForm.imageFile = file.raw;

        // 创建FileReader对象来读取文件，用于预览
        const reader = new FileReader();
        reader.onload = (e) => {
          // 将图片转换为base64格式存储，仅用于预览
          this.editForm.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file.raw);
      }
    },

    // 上传前校验
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('只能上传 JPG、PNG 或 GIF 格式的图片!');
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!');
      }

      return isJPG && isLt2M;
    },

    // 删除图片
    removeImage() {
      this.editForm.image = '';
      this.editForm.imageFile = null;
      this.editForm.imagePreview = null;
    },

    // 获取图片URL
    getImageUrl(image) {
      if (!image) return '';
      // 如果是完整URL或base64，直接返回
      if (image.startsWith('http') || image.startsWith('data:image')) {
        return image;
      }
      // 否则拼接上传路径
      return `/uploads/${image}`;
    },

    // 保存猫咪信息
    async saveCatChanges() {
      if (!this.editForm.name || !this.editForm.breed) {
        this.$message.error('请填写猫咪名称和品种');
        return;
      }

      try {
        this.savingCat = true;

        const formData = new FormData();

        // 添加文本字段
        formData.append('name', this.editForm.name);
        formData.append('breed', this.editForm.breed);
        formData.append('age', this.editForm.age);
        formData.append('gender', this.editForm.gender);
        formData.append('description', this.editForm.description);

        // 添加图片文件（如果有）
        if (this.editForm.imageFile) {
          formData.append('image', this.editForm.imageFile);
        }

        // 调用API更新猫咪信息
        const updatedCat = await catApi.updateCat(this.cat.id, formData);

        // 更新本地数据
        this.cat = {
          ...this.cat,
          ...updatedCat
        };

        // 关闭弹框
        this.hideEditModal();

        // 显示成功提示
        this.$message.success('猫咪信息更新成功！');
      } catch (error) {
        this.$message.error('更新失败: ' + error.message);
        console.error('更新猫咪信息错误:', error);
      } finally {
        this.savingCat = false;
      }
    },

    // 编辑评论
    editComment(comment) {
      this.editingCommentId = comment.id;
      this.editingCommentContent = comment.content;
    },

    // 取消编辑评论
    cancelEditComment() {
      this.editingCommentId = null;
      this.editingCommentContent = '';
    },

    // 更新评论
    async updateComment(commentId) {
      if (!this.editingCommentContent.trim()) return;

      try {
        const updatedComment = await catApi.updateComment(commentId, this.editingCommentContent);
        const comment = this.findCommentById(this.comments, commentId);
        if (comment) {
          comment.content = updatedComment.content;
          comment.updated_at = updatedComment.updated_at || new Date().toISOString();
        }
        this.cancelEditComment();
      } catch (error) {
        console.error('更新评论失败:', error);
      }
    },

    // 确认删除评论
    confirmDeleteComment(commentId) {
      if (confirm('确定要删除这条评论吗？')) {
        this.deleteComment(commentId);
      }
    },

    // 删除评论
    async deleteComment(commentId) {
      try {
        this.deletingCommentId = commentId;
        await catApi.deleteComment(commentId);
        // 从评论树中删除评论
        this.removeCommentFromTree(this.comments, commentId);
        // 更新猫咪的评论数
        if (this.cat) {
          this.cat.comments = Math.max(0, (this.cat.comments || 0) - 1);
        }
      } catch (error) {
        console.error('删除评论失败:', error);
      } finally {
        this.deletingCommentId = null;
      }
    },

    // 从评论树中删除评论（递归）
    removeCommentFromTree(comments, commentId) {
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.id === commentId) {
          comments.splice(i, 1);
          return true;
        }
        if (comment.replies && comment.replies.length > 0) {
          const removed = this.removeCommentFromTree(comment.replies, commentId);
          if (removed) {
            return true;
          }
        }
      }
      return false;
    },
    getAvatarText(username) {
      if (!username) {
        return 'U';
      }
      return username.charAt(0).toUpperCase();
    }
  }
};
</script>

<style scoped>
.cat-detail {
  padding: 2rem 0;
  width: inherit;
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

/* 评论编辑表单样式 */
.comment-edit-form {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.comment-edit-form textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.comment-edit-form textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* 评论回复表单样式 */
.comment-reply-form {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  border-left: 3px solid #4CAF50;
}

.comment-reply-form textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.comment-reply-form textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.comment-reply-form textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* 回复评论样式 */
.comment-replies {
  margin-top: 1rem;
}

.reply-comment {
  margin-top: 1rem;
  margin-left: 2rem;
  border-left: 2px solid #e0e0e0;
  padding-left: 1rem;
}

.reply-comment .comment-item {
  background-color: #f9f9f9;
}

/* 回复分页控制样式 */
.reply-pagination {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e0e0e0;
  text-align: left;
}

.reply-pagination .comment-action-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  color: #666;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.3s ease;
  border-radius: 4px;
}

.reply-pagination .comment-action-btn:hover {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.reply-pagination .comment-action-btn .icon {
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .reply-comment {
    margin-left: 1rem;
    padding-left: 0.5rem;
  }

  .reply-pagination .comment-action-btn {
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
  }

  .reply-pagination .comment-action-btn .icon {
    font-size: 0.8rem;
  }
}

/* 弹框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease;
}

.edit-modal-content {
  max-width: 600px;
}

/* 编辑表单样式 */
.edit-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-control[type="number"] {
  width: 150px;
}

.form-control[type="url"] {
  word-break: break-all;
}

.form-control[type="textarea"],
textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* 图片上传样式 */
.image-upload-container {
  margin-top: 0.5rem;
}

.image-preview {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.remove-image-btn:hover {
  background-color: #fff;
  transform: scale(1.1);
}

.image-upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.image-upload-area:hover {
  border-color: #4CAF50;
  background-color: #f5f5f5;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}

.image-upload-area p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.image-upload-input {
  display: none;
}

.avatar-upload-input {
  display: none;
}

/* Element UI 头像上传器样式 */
.avatar-uploader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #999;
  width: 150px;
  height: 150px;
  line-height: 150px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-uploader-icon:hover {
  border-color: #4CAF50;
  color: #4CAF50;
}

/* 上传触发区域样式 */
.avatar-uploader-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
}

.avatar-uploader-trigger:hover {
  opacity: 0.8;
  border-color: #4CAF50;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 1.5rem;
  color: #666;
}

.cat-preview {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.cat-preview-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.cat-preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cat-preview-info h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.cat-preview-info p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.modal-footer .btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.modal-footer .btn-secondary {
  background-color: #6c757d;
  color: white;
}

.modal-footer .btn-secondary:hover {
  background-color: #5a6268;
}

.modal-footer .btn-primary {
  background-color: #4CAF50;
  color: white;
}

.modal-footer .btn-primary:hover {
  background-color: #45a049;
}

/* 响应式弹框 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: 400px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .cat-preview {
    flex-direction: column;
    text-align: center;
  }

  .cat-preview-img {
    width: 100%;
    height: 150px;
  }
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sm.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-sm.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-sm:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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