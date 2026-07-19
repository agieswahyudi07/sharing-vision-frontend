<script setup lang="ts">
import { ref, onMounted, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL } from '../config'

interface Article {
  id: number
  title: string
  content: string
  category: string
  created_date: string
  updated_date: string
  status: string
}

const router = useRouter()
const triggerToast = inject<(msg: string, type?: 'success' | 'error') => void>('triggerToast')

const activeTab = ref<'publish' | 'draft' | 'thrash'>('publish')
const articles = ref<Article[]>([])
const loading = ref(false)

// Count stats for each tab
const publishCount = ref(0)
const draftCount = ref(0)
const thrashCount = ref(0)

const fetchCounts = async () => {
  try {
    const fetchCountForStatus = async (status: string) => {
      const res = await fetch(`${API_BASE_URL}/article/1/0?status=${status}`)
      if (res.ok) {
        const totalHeader = res.headers.get('X-Total-Count')
        return totalHeader ? parseInt(totalHeader, 10) : 0
      }
      return 0
    }
    publishCount.value = await fetchCountForStatus('publish')
    draftCount.value = await fetchCountForStatus('draft')
    thrashCount.value = await fetchCountForStatus('thrash')
  } catch (error) {
    console.error('Error fetching tab counts:', error)
  }
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE_URL}/article/100/0?status=${activeTab.value}`)
    if (res.ok) {
      articles.value = await res.json()
    } else {
      articles.value = []
      if (triggerToast) triggerToast('Failed to fetch articles', 'error')
    }
  } catch (error) {
    console.error('Error fetching articles:', error)
    articles.value = []
    if (triggerToast) triggerToast('Server is unreachable', 'error')
  } finally {
    loading.value = false
  }
}

const handleTrash = async (id: number) => {
  if (activeTab.value === 'thrash') {
    // If we're already in thrash, then trash icon will permanently delete the post
    if (!confirm('Are you sure you want to permanently delete this article?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/article/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        if (triggerToast) triggerToast('Article permanently deleted successfully')
        fetchArticles()
        fetchCounts()
      } else {
        if (triggerToast) triggerToast('Failed to delete article', 'error')
      }
    } catch (e) {
      if (triggerToast) triggerToast('Server error', 'error')
    }
    return
  }

  // Otherwise, move to thrash status
  try {
    const articleRes = await fetch(`${API_BASE_URL}/article/${id}`)
    if (!articleRes.ok) return
    const article: Article = await articleRes.json()

    // Update status to thrash
    article.status = 'thrash'

    const res = await fetch(`${API_BASE_URL}/article/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: article.title,
        content: article.content,
        category: article.category,
        status: 'thrash',
      }),
    })

    if (res.ok) {
      if (triggerToast) triggerToast('Article moved to Trashed')
      fetchArticles()
      fetchCounts()
    } else {
      const errData = await res.json()
      const errMsg = errData.error || errData.errors ? Object.values(errData.errors).join(', ') : 'Failed to move to trash'
      if (triggerToast) triggerToast(errMsg, 'error')
    }
  } catch (error) {
    if (triggerToast) triggerToast('Network error', 'error')
  }
}

const navigateToEdit = (id: number) => {
  router.push(`/edit/${id}`)
}

watch(activeTab, () => {
  fetchArticles()
})

onMounted(() => {
  fetchArticles()
  fetchCounts()
})
</script>

<template>
  <div>
    <div class="header-section">
      <div>
        <h1 class="page-title">All Posts</h1>
        <p class="page-subtitle">Manage and organize all your written articles</p>
      </div>
      <button @click="router.push('/add')" class="btn btn-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        Add New Post
      </button>
    </div>

    <!-- Tabs Menu -->
    <div class="tabs-container">
      <button 
        @click="activeTab = 'publish'" 
        class="tab-btn" 
        :class="{ active: activeTab === 'publish' }"
      >
        Published
        <span class="tab-badge">{{ publishCount }}</span>
      </button>
      <button 
        @click="activeTab = 'draft'" 
        class="tab-btn" 
        :class="{ active: activeTab === 'draft' }"
      >
        Drafts
        <span class="tab-badge">{{ draftCount }}</span>
      </button>
      <button 
        @click="activeTab = 'thrash'" 
        class="tab-btn" 
        :class="{ active: activeTab === 'thrash' }"
      >
        Trashed
        <span class="tab-badge">{{ thrashCount }}</span>
      </button>
    </div>

    <!-- Table Container -->
    <div class="card">
      <div v-if="loading" class="empty-state">
        <div class="empty-text">Loading articles...</div>
      </div>
      <div v-else-if="articles.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <div class="empty-text">No articles found</div>
        <p>There are no articles in the current "{{ activeTab }}" state.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th style="width: 55%">Title</th>
              <th style="width: 25%">Category</th>
              <th style="width: 20%; text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id">
              <td>
                <div style="font-weight: 600; color: white;">{{ article.title }}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                  Last updated: {{ new Date(article.updated_date).toLocaleString() }}
                </div>
              </td>
              <td>
                <span class="badge-category">{{ article.category }}</span>
              </td>
              <td style="text-align: center;">
                <div class="actions-cell" style="justify-content: center;">
                  <button 
                    @click="navigateToEdit(article.id)" 
                    class="btn-icon edit" 
                    title="Edit Article"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  </button>
                  <button 
                    @click="handleTrash(article.id)" 
                    class="btn-icon trash" 
                    :title="activeTab === 'thrash' ? 'Delete Permanently' : 'Move to Trash'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
