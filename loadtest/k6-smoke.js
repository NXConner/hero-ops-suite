import http from "k6/http";
import { check, sleep } from "k6";

export const options = { vus: 1, duration: "30s" };

export default function () {
  const res = http.get(__ENV.TARGET_URL || "http://localhost:8080");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body contains app root": (r) => r.body && r.body.includes('<div id="root"></div>'),
  });
  sleep(1);
}
