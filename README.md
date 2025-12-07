# 🎲 Sistema Cotizador de Impresiones 3D - Frontend

Aplicación web moderna para la cotización automática de servicios de impresión 3D. Permite a los usuarios visualizar modelos STL en tiempo real, calcular costos basados en volumen y material, y gestionar pedidos.

Este proyecto es la interfaz de usuario (Frontend) construida con **React** y **Vite**, diseñada para conectarse con un Backend en Spring Boot.

## 🚀 Características Principales

* **Visualizador 3D Interactivo:** Renderizado de archivos `.stl` usando Three.js y React Three Fiber.
* **Cálculo Automático:** Obtención de dimensiones (X, Y, Z) y escalado proporcional automático.
* **Cotización Dinámica:** Precios ajustados en tiempo real según el material (Resina/PLA) y volumen.
* **Seguridad:** Autenticación de usuarios mediante JWT (JSON Web Tokens).
* **Roles de Usuario:** Interficies adaptadas para Clientes, Vendedores y Administradores.
* **Generación de PDF:** Descarga de comprobantes de cotización al instante.
* **Diseño UI:** Interfaz "Dark Mode" profesional usando Tailwind CSS.

## 🛠️ Tecnologías Utilizadas

* **Core:** React 18, Vite.
* **Estilos:** Tailwind CSS.
* **3D Engine:** Three.js, @react-three/fiber, @react-three/drei.
* **HTTP Client:** Axios (con interceptores para JWT).
* **Utilidades:** SweetAlert2 (Alertas), jsPDF (Reportes), Lucide React (Iconos).

## 📋 Requisitos Previos

* Node.js (v18 o superior).
* NPM (Gestor de paquetes).
* Backend Java Spring Boot corriendo en el puerto `8080`.
