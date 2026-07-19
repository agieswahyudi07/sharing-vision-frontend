<script setup lang="ts">
import { ref, onMounted, watch, inject } from 'vue'
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

const triggerToast = inject<(msg: string, type?: 'success' | 'error') => void>('triggerToast')

const articles = ref<Article[]>([])
const loading = ref(false)

// Pagination states
const currentPage = ref(1)
const limit = 6
const totalCount = ref(0)
const totalPages = ref(0)

const fetchPublishedArticles = async () => {
  loading.value = true
  const offset = (currentPage.value - 1) * limit
  try {
    const res = await fetch(`${API_BASE_URL}/article/${limit}/${offset}?status=publish`)
    if (res.ok) {
      articles.value = await res.json()
      
      // Parse total count from custom header
      const totalHeader = res.headers.get('X-Total-Count')
      if (totalHeader) {
        totalCount.value = parseInt(totalHeader, 10)
        totalPages.value = Math.ceil(totalCount.value / limit)
      } else {
        totalCount.value = articles.value.length
        totalPages.value = 1
      }
    } else {
      if (triggerToast) triggerToast('Failed to fetch preview posts', 'error')
    }
  } catch (error) {
    console.error(error)
    if (triggerToast) triggerToast('Network error while loading preview', 'error')
  } finally {
    loading.value = false
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

watch(currentPage, () => {
  fetchPublishedArticles()
})

onMounted(() => {
  fetchPublishedArticles()
})
</script>

<template>
  <div>
    <div class="header-section">
      <div>
        <h1 class="page-title">Blog Preview</h1>
        <p class="page-subtitle">Live view of your published articles, formatted for readers</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="card">
      <div class="empty-state">
        <div class="empty-text">Loading blog posts...</div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="articles.length === 0" class="card">
      <div class="empty-state">
        <div class="empty-icon">📰</div>
        <div class="empty-text">No published posts yet</div>
        <p>Go to "All Posts" or "Add New" to create and publish your first article.</p>
      </div>
    </div>

    <!-- Blog Grid -->
    <div v-else>
      <div class="preview-grid">
        <div v-for="article in articles" :key="article.id" class="post-card">
          <div class="post-card-meta">
            <span class="badge-category">{{ article.category }}</span>
            <span class="post-card-date">
              {{ new Date(article.created_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </span>
          </div>
          <h2 class="post-card-title">{{ article.title }}</h2>
          <p class="post-card-content">{{ article.content }}</p>
          <div style="margin-top: auto; border-top: 1px solid var(--border-color); padding-top: 0.75rem; font-size: 0.8rem; color: var(--text-muted);">
            ID: #{{ article.id }}
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="prevPage" 
          class="btn btn-secondary" 
          :disabled="currentPage === 1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }} ({{ totalCount }} posts)
        </span>
        <button 
          @click="nextPage" 
          class="btn btn-secondary" 
          :disabled="currentPage === totalPages"
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>
