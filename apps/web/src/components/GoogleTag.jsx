import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

// Chèn nguyên văn đoạn mã admin dán vào (thẻ <script>, <noscript>...) và cho
// nó chạy thật sự — dùng createContextualFragment vì gán qua innerHTML thì
// trình duyệt sẽ không thực thi <script> bên trong vì lý do bảo mật.
const toFragment = (html) => {
  const range = document.createRange();
  range.selectNode(document.body);
  return range.createContextualFragment(html);
};

const GoogleTag = () => {
  const { settings } = useSiteSettings();
  const head = settings.googleTagHead?.trim();
  const body = settings.googleTagBody?.trim();

  useEffect(() => {
    if (!head) return;
    const fragment = toFragment(head);
    const nodes = Array.from(fragment.childNodes);
    document.head.appendChild(fragment);
    return () => nodes.forEach((n) => n.parentNode?.removeChild(n));
  }, [head]);

  useEffect(() => {
    if (!body) return;
    const fragment = toFragment(body);
    const nodes = Array.from(fragment.childNodes);
    document.body.insertBefore(fragment, document.body.firstChild);
    return () => nodes.forEach((n) => n.parentNode?.removeChild(n));
  }, [body]);

  return null;
};

export default GoogleTag;
