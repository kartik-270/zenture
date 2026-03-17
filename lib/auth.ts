"use client"

import { jwtDecode } from "jwt-decode"

interface TokenPayload {
  sub?: string
  role?: string
  exp?: number
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem("auth_token")
  if (!token || token === "null" || token === "undefined") return null
  return token
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("username")
}

export function getUserRole(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("userRole")
}

export function isAuthenticated(): boolean {
  const token = getAuthToken()
  if (!token) return false
  
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      logout()
      return false
    }
    return true
  } catch {
    return false
  }
}

export function decodeToken(): TokenPayload | null {
  const token = getAuthToken()
  if (!token) return null
  
  try {
    return jwtDecode<TokenPayload>(token)
  } catch {
    return null
  }
}

export function setAuthData(token: string, username: string, role?: string): void {
  localStorage.setItem("auth_token", token)
  localStorage.setItem("username", username)
  if (role) {
    localStorage.setItem("userRole", role)
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("storage-changed"))
  }
}

export function logout(): void {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("username")
  localStorage.removeItem("userRole")
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new Event("storage-changed"))
  }
}

export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const token = getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  
  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "omit",
  })
  
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  
  return res.json()
}
