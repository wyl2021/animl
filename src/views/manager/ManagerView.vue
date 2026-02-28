<template>
  <div class="manager-view">
    <h2 class="page-title">用户管理</h2>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="showRegisterModal = true">注册新用户</el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" style="text-align: center; padding: 3rem;">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <el-button @click="fetchUsers">重试</el-button>
    </div>

    <!-- 用户列表 -->
    <div v-else>
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="account" label="账号" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'warning' : 'info'">
              {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="editUser(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteUser(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <div v-if="users.length === 0" class="empty-state">
        <p>暂无用户数据</p>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-if="totalPages > 1" v-model:current-page="currentPage" :page-size="pageSize"
          :total="totalItems" layout="prev, pager, next, jumper" @current-change="fetchUsers" />
      </div>
    </div>

    <!-- 注册用户弹窗 -->
    <el-dialog v-model="showRegisterModal" title="注册新用户" width="500px">
      <el-form ref="registerFormRef" :model="registerForm" :rules="registerFormRules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="registerForm.name"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="registerForm.account"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="registerForm.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="registerForm.confirmPassword"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="registerForm.role" placeholder="选择角色">
            <el-option label="普通用户" value="user"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRegisterModal = false">取消</el-button>
          <el-button type="primary" @click="registerUser" :loading="submitting">注册</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑用户弹窗 -->
    <el-dialog v-model="showEditModal" title="编辑用户" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="editForm.account"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="editForm.password" placeholder="不修改请留空"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="editForm.confirmPassword" placeholder="不修改请留空"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="选择角色">
            <el-option label="普通用户" value="user"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditModal = false">取消</el-button>
          <el-button type="primary" @click="updateUser" :loading="submitting">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import catApi from '../../api/catApi'

export default {
  name: 'ManagerView',
  data() {
    return {
      // 用户列表
      users: [],
      loading: false,
      error: '',
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 1,

      // 注册用户
      showRegisterModal: false,
      registerForm: {
        name: '',
        account: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      },
      registerFormRules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, min: 6, message: '密码长度至少为6位', trigger: 'blur' }],
        confirmPassword: [
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
      },

      // 编辑用户
      showEditModal: false,
      editForm: {
        id: '',
        name: '',
        account: '',
        password: '',
        confirmPassword: '',
        role: 'user'
      },
      editFormRules: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ min: 6, message: '密码长度至少为6位', trigger: 'blur' }],
        confirmPassword: [
          {
            validator: (rule, value, callback) => {
              if (this.editForm.password && value !== this.editForm.password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
      },

      // 提交状态
      submitting: false
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    // 获取用户列表
    async fetchUsers() {
      try {
        this.loading = true
        this.error = ''
        // 这里需要根据实际的API接口修改
        const response = await catApi.getUsers(this.currentPage, this.pageSize)
        this.users = response || []
        this.totalItems = response.pagination?.total || 0
        this.totalPages = response.pagination?.totalPages || 1
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.error = '获取用户列表失败'
        ElMessage.error('获取用户列表失败')
      } finally {
        this.loading = false
      }
    },

    // 注册新用户
    async registerUser() {
      try {
        await this.$refs.registerFormRef.validate()

        this.submitting = true

        // 调用API注册用户
        await catApi.registerUser(this.registerForm)
        ElMessage.success('注册成功！')
        this.showRegisterModal = false
        this.fetchUsers()

        // 重置表单
        this.registerForm = {
          name: '',
          account: '',
          password: '',
          confirmPassword: '',
          role: 'user'
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('注册失败: ' + error.message)
          console.error('注册用户错误:', error)
        }
      } finally {
        this.submitting = false
      }
    },

    // 编辑用户
    editUser(user) {
      this.editForm = {
        id: user.id,
        name: user.name,
        account: user.account,
        password: '',
        confirmPassword: '',
        role: user.role
      }
      this.showEditModal = true
    },

    // 更新用户
    async updateUser() {
      try {
        await this.$refs.editFormRef.validate()

        this.submitting = true

        // 准备更新数据
        const updateData = {
          name: this.editForm.name,
          account: this.editForm.account,
          role: this.editForm.role
        }

        // 只有当密码不为空时才更新密码
        if (this.editForm.password) {
          updateData.password = this.editForm.password
        }

        // 调用API更新用户
        await catApi.updateUser(this.editForm.id, updateData)
        ElMessage.success('更新成功！')
        this.showEditModal = false
        this.fetchUsers()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('更新失败: ' + error.message)
          console.error('更新用户错误:', error)
        }
      } finally {
        this.submitting = false
      }
    },

    // 删除用户
    async deleteUser(userId) {
      try {
        await ElMessageBox.confirm('确定要删除这个用户吗？', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 调用API删除用户
        await catApi.deleteUser(userId)
        ElMessage.success('删除成功！')
        this.fetchUsers()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败: ' + error.message)
          console.error('删除用户错误:', error)
        }
      }
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    }
  }
}
</script>

<style scoped>
.manager-view {
  padding: 20px;
  width: 100%;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.action-bar {
  margin-bottom: 20px;
}

.error-state {
  text-align: center;
  padding: 3rem;
  color: #f56c6c;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #909399;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>