<template>
  <div class="analysis-container text-white p-4">
    <!-- 筛选面板 -->
    <div class="filter-panel bg-[rgba(30,41,59,0.6)] p-5 rounded-xl">
      <h2 class="text-lg font-semibold pb-4">筛选面板</h2>

      <el-form :model="filters" :rules="rules" ref="formRef" label-width="50px">
        <!-- 区域 -->
        <el-form-item label="区域">
          <el-select
            v-model="filters.region"
            placeholder="所有区"
            clearable
            class="w-full"
            popper-class="dark-dropdown"
          >
            <el-option :value="''" label="所有区" />
            <el-option v-for="item in regionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <!-- 面积 -->
        <el-form-item label="面积">
          <el-slider v-model="filters.areaRange" range :min="minArea" :max="maxArea" :step="1" />
          <div class="hint">{{ filters.areaRange[0] }}㎡ - {{ filters.areaRange[1] }}㎡</div>
        </el-form-item>

        <!-- 价格 -->
        <el-form-item label="价格">
          <el-slider v-model="filters.priceRange" range :min="minPrice" :max="maxPrice" :step="1" />
          <div class="hint">{{ filters.priceRange[0] }}万 - {{ filters.priceRange[1] }}万</div>
        </el-form-item>

        <!-- 户型 -->
        <el-form-item label="户型">
          <div class="flex gap-2 w-full">
            <el-form-item prop="rooms" class="flex-1 mb-0">
              <el-input-number v-model="filters.rooms" :min="1" :step="1" placeholder="几室" style="width:100%" />
            </el-form-item>
            <el-form-item prop="halls" class="flex-1 mb-0">
              <el-input-number v-model="filters.halls" :min="1" :step="1" placeholder="几厅" style="width:100%" />
            </el-form-item>
          </div>
        </el-form-item>

        <el-button type="primary" @click="submitForm" class="w-full">查询</el-button>
      </el-form>
    </div>

    <!-- 数据展示 -->
    <div class="data-panel bg-[rgba(30,41,59,0.6)] p-4 rounded-xl flex-1 ml-6">
      <h2 class="text-lg font-semibold pb-4">数据结果</h2>

      <el-empty v-if="!paged.length" description="暂无数据" :image-size="80" class="empty-center" />

      <template v-else>
        <el-table
          :data="paged"
          size="small"
          border
          stripe
          height="572"
          class="dark-table"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
        >
          <el-table-column prop="address" label="地址" min-width="220" show-overflow-tooltip />
          <el-table-column prop="district" label="区域" width="90" />
          <el-table-column prop="area" label="面积㎡" width="100" />
          <el-table-column prop="size" label="户型总数" width="100" />
          <el-table-column prop="floor" label="楼层" width="70" />
          <el-table-column prop="decoration" label="装修" width="90" />
          <el-table-column prop="establishment_year" label="年份" width="80" />
          <el-table-column prop="total_price" label="总价万" width="100" />
          <el-table-column prop="unit_price" label="单价元/㎡" width="110" />
        </el-table>

        <br />
        <div class="mt-3 flex justify-between items-center">
          <div class="text-sm text-[rgba(255,255,255,0.7)]">
            共 {{ total }} 套，当前第 {{ currentPage }} / {{ totalPages }} 页
          </div>
          <el-pagination
            small
            background
            layout="prev, pager, next, jumper, ->, sizes"
            :total="total"
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 14, 17, 20]"
            @current-change="(p) => (currentPage = p)"
            @size-change="(s) => { pageSize = s; currentPage = 1 }"
            class="dark-pagination"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import houses from '../api/point.json' // 本地数据

/* 路由 */
const route = useRoute()
const router = useRouter()

/* 表单/筛选 */
const formRef = ref(null)
const filters = ref({
  region: '',
  areaRange: [20, 500],
  priceRange: [10, 1000],
  rooms: null,
  halls: null
})

const rules = {
  rooms: [{ type: 'number', message: '请输入几室', trigger: 'change' }],
  halls: [{ type: 'number', message: '请输入几厅', trigger: 'change' }]
}

/* 动态范围 */
const regionOptions = Array.from(new Set(houses.map(h => (h.district || '').trim()).filter(Boolean)))
const minArea = Math.floor(Math.min(...houses.map(h => Number(h.area) || 0)))
const maxArea = Math.ceil(Math.max(...houses.map(h => Number(h.area) || 0)))
const minPrice = Math.floor(Math.min(...houses.map(h => Number(h.total_price) || 0)))
const maxPrice = Math.ceil(Math.max(...houses.map(h => Number(h.total_price) || 0)))

/* 路由 -> 面板：进入与变化时同步 */
function syncFiltersFromQuery() {
  const q = route.query
  filters.value.region = q.region ? String(q.region) : ''

  filters.value.areaRange = [
    q.areaMin ? Number(q.areaMin) : minArea,
    q.areaMax ? Number(q.areaMax) : maxArea
  ]
  filters.value.priceRange = [
    q.priceMin ? Number(q.priceMin) : minPrice,
    q.priceMax ? Number(q.priceMax) : maxPrice
  ]
  filters.value.rooms = q.rooms ? Number(q.rooms) : null
  filters.value.halls = q.halls ? Number(q.halls) : null
}
onMounted(syncFiltersFromQuery)
watch(() => route.query, syncFiltersFromQuery, { deep: true })

/* 过滤 + 排序 */
const filtered = computed(() => {
  const f = filters.value
  return houses
    .filter(h => {
      const area = Number(h.area) || 0
      const total = Number(h.total_price) || 0
      const okRegion = !f.region || h.district === f.region
      const okArea = area >= f.areaRange[0] && area <= f.areaRange[1]
      const okPrice = total >= f.priceRange[0] && total <= f.priceRange[1]
      const okSize = (f.rooms && f.halls) ? Number(h.size) === (f.rooms + f.halls) : true
      return okRegion && okArea && okPrice && okSize
    })
    .sort((a, b) => Number(b.total_price) - Number(a.total_price))
})

/* 分页 */
const currentPage = ref(1)
const pageSize = ref(17)
const total = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const paged = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})
watch(filtered, () => { currentPage.value = 1 })

/* 表格样式 */
const headerCellStyle = () => ({
  background: 'rgba(15,23,42,0.6)',
  color: 'rgba(255,255,255,0.9)',
  borderColor: 'rgba(255,255,255,0.08)'
})
const cellStyle = () => ({
  borderColor: 'rgba(255,255,255,0.06)',
  // color: 'rgba(255,255,255,0.85)'
})

/* 查询：把当前筛选回写到 URL（可分享） */
const submitForm = () => {
  formRef.value?.validate?.(() => {
    const f = filters.value
    const query = {
      region: f.region || undefined,
      areaMin: f.areaRange?.[0],
      areaMax: f.areaRange?.[1],
      priceMin: f.priceRange?.[0],
      priceMax: f.priceRange?.[1],
      rooms: f.rooms || undefined,
      halls: f.halls || undefined,
      // 保留现有的 batch（如果之前由地图页带过来）
      batch: route.query.batch ? String(route.query.batch) : undefined
    }
    Object.keys(query).forEach(k => query[k] === undefined && delete query[k])
    router.push({ path: route.path, query })
  })
}
</script>

<style scoped>
.analysis-container { display: flex; height: 100%; }
.filter-panel { flex: 1; max-width: 360px; }
.data-panel { flex: 2; margin-left: 14px; }

/* 空态居中 */
.empty-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 辅助文字 */
.hint { margin-top: 4px; font-size: 12px; color: rgba(255,255,255,0.7); }

/* 表格 hover 的深色适配 */
.dark-table :deep(.el-table__body tr:hover>td) { background-color: rgba(255,255,255,0.06) !important; }
.dark-table :deep(.el-table__inner-wrapper::before) { background-color: rgba(255,255,255,0.08); }

/* 分页器暗色背景 */
.dark-pagination :deep(.btn-next),
.dark-pagination :deep(.btn-prev),
.dark-pagination :deep(.el-pager li),
.dark-pagination :deep(.el-pagination__editor.el-input .el-input__inner) {
  background: rgba(15,23,42,0.6);
  color: rgba(255,255,255,0.9);
  border: 1px solid rgba(255,255,255,0.12);
}
.dark-pagination :deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: rgba(56,189,248,0.9);
  color: #0b1220;
  border-color: transparent;
}
</style>
