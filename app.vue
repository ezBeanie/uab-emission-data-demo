<template>
  <div class="container mx-auto p-4 h-full">
    <h1 class="text-2xl font-bold mb-4">Ozon (O3) Immissionsdaten</h1>
    <h3 class="text-lg font-semibold mb-4">für die Station in Radebeul Wahnsdorf</h3>

    <UCard>
      <template #header>
        <div class="flex gap-4">
          <UFormGroup label="Startdatum">
            <UInput type="date" v-model="startDate" :max="today"/>
          </UFormGroup>

          <UFormGroup label="Enddatum">
            <UInput type="date" v-model="endDate" :min="startDate" :max="today"/>
          </UFormGroup>

          <UFormGroup label="Darstellung">
            <div class="flex gap-2">
              <UButton
                :variant="viewMode === 'table' ? 'solid' : 'outline'"
                @click="viewMode = 'table'">
                Tabelle
              </UButton>
              <UButton
                :variant="viewMode === 'plot' ? 'solid' : 'outline'"
                @click="viewMode = 'plot'">
                Diagramm
              </UButton>
            </div>
          </UFormGroup>
        </div>
      </template>
      <Transition name="fade" mode="out-in">
        <div v-if="loading" key="loading">
          <USkeleton style="min-height: 400px" key="skeleton"/>
        </div>
        <div v-else class="flex flex-col gap-4" key="content">
          <Transition name="fade" mode="out-in">
            <div v-if="viewMode === 'table'" key="table">
              <UTable :columns="columns" :rows="airData" class="mt-4"/>
            </div>
            <div v-else key="plot">
              <client-only>
                <nuxt-plotly :data="plotData" :layout="layout"/>
              </client-only>
            </div>
          </Transition>
        </div>
      </Transition>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, watch} from 'vue';

const today = computed(() => new Date().toISOString().split('T')[0]);
const yesterday = computed(() => new Date(Date.now() - 86400000).toISOString().split('T')[0]);

const airData = ref<any[]>([]);
const startDate = ref<string>(yesterday.value);
const endDate = ref<string>(today.value);
const loading = ref<boolean>(false);
const viewMode = ref<'plot' | 'table'>('plot');

const columns = [
  {key: 'timestamp', label: 'Zeitpunkt', formatter: (value: string) => new Date(value).toLocaleString()},
  {key: 'value', label: 'Ozon-Konzentration (µg/m³)'}
];

const layout = {
  title: 'Ozon-Konzentration über Zeit',
  xaxis: {title: 'Zeit', type: 'date'},
  yaxis: {title: 'Konzentration (µg/m³)', type: 'linear'},
  autosize: true
};

const plotData = computed(() => [
  {
    x: airData.value.map(entry => entry.timestamp),
    y: airData.value.map(entry => entry.value),
    type: 'scatter',
    mode: 'lines',
    name: 'Ozon-Konzentration (µg/m³)'
  }
]);

onMounted(() => fetchData());

const fetchData = async () => {
  loading.value = true;
  try {
    airData.value = await $fetch('/api/measures', {
      query: {startDate: startDate.value, endDate: endDate.value}
    });
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

watch([startDate, endDate], fetchData);
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
