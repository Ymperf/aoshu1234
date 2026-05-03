import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "小学奥数学习平台",
  description: "面向 1-6 年级的模块化奥数学习平台"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
