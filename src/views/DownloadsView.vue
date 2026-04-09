<template>
  <div class="map-container">
    <div class="map-tip">
      <p>缩放地图 → 查看不同层级</p>
      <p>点击标注 → 查看房源信息和详细位置</p>
    </div>
    <button class="logout-btn" @click="handleLogout">退出</button>
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { onMounted,ref } from "vue";
import { useRouter } from "vue-router";
import { loadBMapGL } from "../utils/loadBMapGL";
import data from "../api/point.json";

const points = data;

const router = useRouter();

const handleLogout = () => {
  router.push({ name: 'Home' });
};

onMounted(async () => {
  const BMapGL = await loadBMapGL("1HCjQtCG2rxE32RvMZkAB4hSW3bAfZGR");

  const map = new BMapGL.Map("map", { tilt: 45 });
  const center = new BMapGL.Point(104.0668, 30.5728);
  map.centerAndZoom(center, 12);
  map.enableScrollWheelZoom(true);
  map.enableContinuousZoom(true);
  map.setTilt(45);
  map.setHeading(0);
  map.setZoom(14);
map.setMapStyleV2({
  styleId: '02a6702d736c7265dad65182efcd4390'
});
  const geocoder = new BMapGL.Geocoder();

  points.forEach((p) => {
    const marker = new BMapGL.Marker(new BMapGL.Point(p.lng, p.lat));
    map.addOverlay(marker);

    marker.addEventListener("click", () => {
      geocoder.getLocation(new BMapGL.Point(p.lng, p.lat), (result) => {
        const address = result.address || "未获取到详细地址";
        const infoContent = `
          <div class="info-card">
            <h4>地区: ${p.address}</h4>
            <p>户型: ${p.size}室厅</p>
            <p>建筑类型: ${p.house_type}</p>
            <p>面积: ${p.area} 平方米</p>
            <p>装修: ${p.decoration}</p>
            <p>楼层: ${p.floor}位</p>
            <p>朝向: ${p.orientation}</p>
            <p>总价: ¥${p.total_price} 万</p>
            <p>单价: ¥${p.unit_price} 元/平米</p>
            <p>关注人数: ${p.number_of_followers}</p>
            <p>发布时间: ${p.release_time}</p>
            <p>建成年份: ${p.establishment_year} 年 (房龄: ${p.age} 年)</p>
            <p>详细地址: ${address}</p>
            <br\>
          </div>
        `;
        const infoWindow = new BMapGL.InfoWindow(infoContent, {
          width: 300,
          height: 250,
          offset: new BMapGL.Size(0, -30),
        });

      
        map.openInfoWindow(infoWindow, new BMapGL.Point(p.lng, p.lat));
      });
    });
  });
});
</script>

<style scoped>
/* 保持原有样式 */
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
.map {
  width: 100%;
  height: 100%;
}

.map-tip {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(30, 41, 59, 0.7);
  color: white;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 10;
}

.logout-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  z-index: 10;
  transition: background-color 0.3s ease;
}
.logout-btn:hover {
  background-color: #c82333;
}

/* 信息卡片样式 */
.info-card {
  width: 100%;
  font-family: "Arial", sans-serif;
}
.info-card h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}
.info-card p {
  margin: 2px 0;
  font-size: 14px;
  color: #555;
}


</style>