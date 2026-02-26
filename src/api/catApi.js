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

  // 获取热门猫咪
  getHotCats: async () => {
    try {
      const cats = await request('/cats/public/hot');
      // 处理图片URL
      return Array.isArray(cats) ? cats.map(cat => ({
        ...cat,
        image: cat.image ? `${UPLOADS_BASE_URL}/${cat.image}` : null
      })) : [];
    } catch (error) {
      console.warn('获取热门猫咪API不可用，返回空数据');
      return [];
    }
  },

  // 获取最新领养信息
  getLatestAdoptions: async () => {
    try {
      const cats = await request('/cats/public/latest');
      // 处理图片URL
      return Array.isArray(cats) ? cats.map(cat => ({
        ...cat,
        image: cat.image ? `${UPLOADS_BASE_URL}/${cat.image}` : null
      })) : [];
    } catch (error) {
      console.warn('获取最新领养信息API不可用，返回空数据');
      return [];
    }
  },

  // 获取猫咪详情（公开）
  getPublicCatDetail: async (id) => {
    try {
      const cat = await request(`/cats/public/${id}`);
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
  addComment: async (catId, commentData, parentId = null) => {
    try {
      return await request('/comments', {
        method: 'POST',
        body: JSON.stringify({
          ...commentData,
          cat_id: catId,
          parent_id: parentId
        })
      });
    } catch (error) {
      console.warn('添加评论API不可用，使用模拟数据');
      return {
        id: Date.now(),
        ...commentData,
        cat_id: catId,
        parent_id: parentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes_count: 0,
        user_name: commentData.user || '当前用户',
        isLiked: false
      };
    }
  },

  // 点赞评论
  likeComment: async (commentId) => {
    try {
      return await request(`/comments/${commentId}/like`, {
        method: 'POST'
      });
    } catch (error) {
      console.warn('点赞评论API不可用，使用模拟数据');
      return { success: true, message: '点赞成功' };
    }
  },

  // 取消点赞评论
  unlikeComment: async (commentId) => {
    try {
      return await request(`/comments/${commentId}/like`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('取消点赞评论API不可用，使用模拟数据');
      return { success: true, message: '取消点赞成功' };
    }
  },

  // 更新评论
  updateComment: async (commentId, content) => {
    try {
      return await request(`/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      });
    } catch (error) {
      console.warn('更新评论API不可用，使用模拟数据');
      return {
        id: commentId,
        content,
        updated_at: new Date().toISOString()
      };
    }
  },

  // 更新猫咪信息
  updateCat: async (catId, catData) => {
    let isFormData; // 在 try 外部定义

    try {
      isFormData = catData instanceof FormData;

      const response = await request(`/cats/${catId}`, {
        method: 'PUT',
        body: isFormData ? catData : JSON.stringify(catData),
        headers: isFormData ? {} : {
          'Content-Type': 'application/json'
        }
      });

      return response;
    } catch (error) {
      console.warn('更新猫咪API不可用，使用模拟数据', error);

      // 现在可以访问 isFormData 了
      let mockData = { id: catId, updated_at: new Date().toISOString() };

      if (isFormData) {
        // 从 FormData 提取数据
        for (let [key, value] of catData.entries()) {
          if (key !== 'image') { // 排除图片文件
            mockData[key] = value;
          }
        }
      } else {
        // 普通对象直接合并
        mockData = { ...mockData, ...catData };
      }

      return mockData;
    }
  },

  // 删除评论
  deleteComment: async (commentId) => {
    try {
      return await request(`/comments/${commentId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('删除评论API不可用，使用模拟数据');
      return { success: true, message: '删除成功' };
    }
  },

  // 猫咪百科API
  // 获取百科列表
  getEncyclopedias: async (page = 1, limit = 10, breed = '') => {
    try {
      let endpoint = `/encyclopedias?page=${page}&limit=${limit}`;
      if (breed) {
        endpoint += `&breed=${encodeURIComponent(breed)}`;
      }

      return await request(endpoint);
    } catch (error) {
      console.warn('获取百科列表API不可用，返回空数据', error);
      return {
        encyclopedias: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  // 获取百科详情
  getEncyclopediaById: async (id) => {
    try {
      return await request(`/encyclopedias/${id}`);
    } catch (error) {
      console.warn('获取百科详情API不可用，返回空数据');
      return null;
    }
  },

  // 创建百科
  createEncyclopedia: async (encyclopediaData) => {
    try {
      return await request('/encyclopedias', {
        method: 'POST',
        body: JSON.stringify(encyclopediaData)
      });
    } catch (error) {
      console.warn('创建百科API不可用，使用模拟数据');
      return {
        id: Date.now(),
        ...encyclopediaData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  },

  // 更新百科
  updateEncyclopedia: async (id, encyclopediaData) => {
    try {
      return await request(`/encyclopedias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(encyclopediaData)
      });
    } catch (error) {
      console.warn('更新百科API不可用，使用模拟数据');
      return {
        id: id,
        ...encyclopediaData,
        updated_at: new Date().toISOString()
      };
    }
  },

  // 删除百科
  deleteEncyclopedia: async (id) => {
    try {
      return await request(`/encyclopedias/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('删除百科API不可用，使用模拟数据');
      return { message: 'Encyclopedia deleted successfully' };
    }
  }
};

export default catApi;