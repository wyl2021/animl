<template>
  <div class="cat-form">
    <h2>{{ isEdit ? '编辑猫咪' : '添加猫咪' }}</h2>
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    <form v-else @submit.prevent="saveCat">
      <div class="form-group">
        <label for="name">姓名</label>
        <input type="text" id="name" v-model="cat.name" required placeholder="请输入猫咪姓名">
      </div>
      <div class="form-group">
        <label for="breed">品种</label>
        <input type="text" id="breed" v-model="cat.breed" required placeholder="请输入猫咪品种">
      </div>
      <div class="form-group">
        <label for="age">年龄</label>
        <input type="number" id="age" v-model="cat.age" required placeholder="请输入猫咪年龄">
      </div>
      <div class="form-group">
        <label for="description">描述</label>
        <textarea id="description" v-model="cat.description" required placeholder="请输入猫咪描述" rows="4"></textarea>
      </div>
      <div class="form-group">
        <label>图片</label>
        <div class="image-upload">
          <div v-if="cat.image" class="preview">
            <img :src="cat.image" alt="预览">
            <button type="button" @click="removeImage" class="btn-remove">删除图片</button>
          </div>
          <div v-else class="upload-area">
            <input type="file" @change="handleFileUpload" accept="image/*">
            <p>点击或拖拽文件到此处上传</p>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <router-link to="/cats" class="btn btn-secondary">取消</router-link>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import catApi from '../../api/catApi';

export default {
  name: 'CatForm',
  data() {
    return {
      cat: {
        id: null,
        name: '',
        breed: '',
        age: '',
        description: '',
        image: ''
      },
      loading: true,
      saving: false,
      imageFile: null // 存储图片文件对象
    };
  },
  computed: {
    isEdit() {
      return !!this.$route.params.id;
    }
  },
  mounted() {
    if (this.isEdit) {
      this.loadCat();
    } else {
      this.loading = false;
    }
  },
  methods: {
    async loadCat() {
      try {
        const id = parseInt(this.$route.params.id);
        const catData = await catApi.getCat(id);
        this.cat = catData;
      } catch (error) {
        console.error('获取猫咪信息失败:', error);
      } finally {
        this.loading = false;
      }
    },
    handleFileUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.imageFile = file;
        // 预览图片
        this.cat.image = URL.createObjectURL(file);
      }
    },
    removeImage() {
      this.cat.image = '';
      this.imageFile = null;
    },
    async saveCat() {
      try {
        this.saving = true;
        
        const catData = {
          name: this.cat.name,
          breed: this.cat.breed,
          age: this.cat.age,
          description: this.cat.description
        };
        
        // 添加图片文件（如果有）
        if (this.imageFile) {
          catData.image = this.imageFile;
        }
        
        if (this.isEdit) {
          // 编辑猫咪
          await catApi.updateCat(this.cat.id, catData);
        } else {
          // 添加猫咪
          await catApi.createCat(catData);
        }
        
        this.$router.push('/cats');
      } catch (error) {
        console.error('保存猫咪失败:', error);
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style scoped>
.cat-form {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.image-upload {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.image-upload:hover {
  border-color: #4CAF50;
}

.preview {
  position: relative;
  display: inline-block;
}

.preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-remove {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area input {
  display: none;
}

.upload-area p {
  color: #666;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
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

@media (max-width: 768px) {
  .cat-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>