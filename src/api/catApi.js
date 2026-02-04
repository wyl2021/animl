import { request, UPLOADS_BASE_URL } from './index';

// 猫咪API服务
const catApi = {
  // 创建猫咪（包含图片上传）
  createCat: async (catData) => {
    try {
      const formData = new FormData();
      
      // 添加文本字段
      formData.append('name', catData.name);
      formData.append('breed', catData.breed || '');
      formData.append('age', catData.age || '');
      formData.append('description', catData.description || '');
      
      // 添加图片文件（如果有）
      if (catData.image && typeof catData.image === 'object') {
        formData.append('image', catData.image);
      }
      
      return await request('/cats', {
        method: 'POST',
        headers: {}, // 不设置Content-Type，让浏览器自动设置
        body: formData
      });
    } catch (error) {
      console.warn('创建猫咪API不可用，使用模拟数据');
      return {
        id: Date.now(),
        ...catData,
        created_at: new Date().toISOString(),
        likes: 0,
        comments: 0
      };
    }
  },
  
  // 获取所有猫咪
  getCats: async (page = 1, pageSize = 6) => {
    try {
      const cats = await request(`/cats?page=${page}&pageSize=${pageSize}`);
      
      // 处理不同的响应结构
      let catsArray = [];
      let total = 0;
      let currentPage = page;
      let currentPageSize = pageSize;
      let totalPages = 1;
      
      if (Array.isArray(cats)) {
        // 如果直接返回数组
        catsArray = cats;
        total = cats.length;
      } else if (cats.data && Array.isArray(cats.data)) {
        // 如果返回包含 data 属性的对象
        catsArray = cats.data;
        total = cats.total || catsArray.length;
        currentPage = cats.page || page;
        currentPageSize = cats.pageSize || pageSize;
        totalPages = cats.totalPages || Math.ceil(total / currentPageSize);
      } else if (cats.items && Array.isArray(cats.items)) {
        // 如果返回包含 items 属性的对象
        catsArray = cats.items;
        total = cats.total || catsArray.length;
        currentPage = cats.page || page;
        currentPageSize = cats.pageSize || pageSize;
        totalPages = cats.totalPages || Math.ceil(total / currentPageSize);
      }
      
      // 处理图片URL
      return {
        data: catsArray.map(cat => ({
          ...cat,
          image: cat.image ? `${UPLOADS_BASE_URL}/${cat.image}` : null
        })),
        total,
        page: currentPage,
        pageSize: currentPageSize,
        totalPages
      };
    } catch (error) {
      console.warn('获取猫咪列表API不可用，返回空数据');
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: pageSize,
        totalPages: 0
      };
    }
  },
  
  // 获取单个猫咪
  getCat: async (id) => {
    try {
      const cat = await request(`/cats/${id}`);
      // 处理图片URL
      return {
        ...cat,
        image: cat.image ? `${UPLOADS_BASE_URL}/${cat.image}` : null
      };
    } catch (error) {
      console.warn('获取猫咪详情API不可用，返回空数据');
      return null;
    }
  },
  
  // 更新猫咪（包含图片上传）
  updateCat: async (id, catData) => {
    try {
      const formData = new FormData();
      
      // 添加文本字段
      formData.append('name', catData.name);
      formData.append('breed', catData.breed || '');
      formData.append('age', catData.age || '');
      formData.append('description', catData.description || '');
      
      // 添加图片文件（如果有）
      if (catData.image && typeof catData.image === 'object') {
        formData.append('image', catData.image);
      }
      
      return await request(`/cats/${id}`, {
        method: 'PUT',
        headers: {}, // 不设置Content-Type，让浏览器自动设置
        body: formData
      });
    } catch (error) {
      console.warn('更新猫咪API不可用，使用模拟数据');
      return {
        id: id,
        ...catData,
        updated_at: new Date().toISOString()
      };
    }
  },
  
  // 删除猫咪
  deleteCat: async (id) => {
    try {
      return await request(`/cats/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('删除猫咪API不可用，使用模拟数据');
      return { success: true, message: '删除成功' };
    }
  },
  
  // 点赞猫咪
  likeCat: async (id) => {
    try {
      return await request(`/cats/${id}/like`, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('点赞API不可用，使用模拟数据');
      return { success: true, message: '点赞成功' };
    }
  },
  
  // 取消点赞猫咪
  unlikeCat: async (id) => {
    try {
      return await request(`/cats/${id}/like`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('取消点赞API不可用，使用模拟数据');
      return { success: true, message: '取消点赞成功' };
    }
  },
  
  // 获取猫咪评论
  getComments: async (catId) => {
    try {
      return await request(`/cats/${catId}/comments`);
    } catch (error) {
      console.warn('评论API不可用，返回空数组');
      return [];
    }
  },
  
  // 添加评论
  addComment: async (catId, commentData) => {
    try {
      return await request(`/cats/${catId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData)
      });
    } catch (error) {
      console.warn('添加评论API不可用，使用模拟数据');
      return { 
        id: Date.now(),
        ...commentData,
        created_at: new Date().toISOString()
      };
    }
  },
  
  // 删除评论
  deleteComment: async (catId, commentId) => {
    try {
      return await request(`/cats/${catId}/comments/${commentId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('删除评论API不可用，使用模拟数据');
      return { success: true, message: '删除成功' };
    }
  }
};

export default catApi;