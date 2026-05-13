import { io } from "socket.io-client";

// Đảm bảo URL này trỏ đúng tới Backend của bạn
const SOCKET_URL = "http://localhost:5000"; 
const socket = io(SOCKET_URL);

socket.on("connect", () => console.log("🟢 Connected to WebSocket Server"));
socket.on("disconnect", () => console.log("🔴 Disconnected from WebSocket Server"));

// XÓA ĐOẠN ChartPage.update() Ở ĐÂY VÌ ĐÂY KHÔNG PHẢI LÀ CÁCH REACT HOẠT ĐỘNG
// React sẽ tự render khi state thay đổi.

export default socket;