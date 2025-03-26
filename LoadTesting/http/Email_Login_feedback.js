import { check, group } from "k6";
import http from "k6/http";

function generateUUIDv7() {
  const now = Date.now().toString(16).padStart(12, "0"); // Convert timestamp to hex
  const randomHex = [...Array(10)] // Generate random values manually
    .map(() =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

  return `${now.slice(0, 8)}-${now.slice(8, 12)}-7${randomHex.slice(0, 3)}-${randomHex.slice(3, 7)}-${randomHex.slice(7, 15)}`;
}

export const options = {
  discardResponseBodies: false, // Keep response bodies for debugging
  scenarios: {
    contactRequests: {
      executor: "constant-arrival-rate",
      // Test duration
      duration: "5s",
      // Number of requests per time unit
      rate: 1, // 30 requests per second
      // Define the time unit
      timeUnit: "1s",
      // Pre-allocate VUs before the test starts
      preAllocatedVUs: 1,
      // Maximum VUs that can be allocated
      maxVUs: 15,
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<5000"], // 95% of requests should be < 1000ms
    "group_duration{group:::SendEmail OTP API}": ["p(95)<5000"], // Main page group duration
    "group_duration{group:::Verify email OTP API}": ["p(95)<5000"], // Assets group duration
    "group_duration{group:::Feedback API}": ["p(95)<5000"],
    "group_duration{group:::Get All Feedback API}": ["p(95)<5000"],
    "group_duration{group:::Feedback count API}": ["p(95)<5000"],
  },
};
//const emails = Array.from({ length: 100 }, (_, i) => `testuser${i}@example.com`);
//for (let email of emails) {add entire code b/w this }
export default function () {
  const deviceId = generateUUIDv7();
  console.log("Generated UUIDv7:", deviceId);
  let accessToken = null;

  group("SendEmail OTP API", () => {
    const params = {
      headers: {
        "Content-Type": "application/json",
        "x-referer": "user",
        "device-id": deviceId,
        Accept: "application/json",
      },
    };

    const body = JSON.stringify({
      email: `${__ENV.EMAIL}`,
    });

    let res1 = http.post(`${__ENV.BASEURL}/v1/auth/send-email-otp`, body, params);

    check(res1, {
      "status code is 200": (r) => r.status === 200,
    });
  });
  group("Verify email OTP API", () => {
    const params = {
      headers: {
        "Content-Type": "application/json",
        "x-referer": "user",
        "device-id": deviceId,
        Accept: "application/json",
      },
    };
    const body2 = JSON.stringify({
      otp: "000000",
      isBusinessInvite: false,
    });

    let res2 = http.post(`${__ENV.BASEURL}/v1/auth/verify-email-otp`, body2, params);
    accessToken = res2.json().data?.access_token;
    console.log(accessToken);
    check(res2, {
      "status code is 200": (r) => r.status === 200,
    });
  });
  group("Feedback API", () => {
    const params2 = {
      headers: {
        "Content-Type": "application/json",
        "x-referer": "user",
        "device-id": deviceId,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const feedbackBody = JSON.stringify({
      business_id: "05f3c22a-6bce-4a20-8174-b0e43b1d33c7",
      type: ["20e74e6d-5088-4efc-b038-4301fa989e79"],
      message: "K6 test run feedback",
      likelihood_of_return: 81,
      is_anonymous: true,
    });

    const res3 = http.post(`${__ENV.BASEURL}/v1/feedback`, feedbackBody, params2);

    // console.log(`Response Status: ${res.status}`);
    console.log(res3.body);
    const jsonResponse = res3.json();
    console.log(`Response Status: ${jsonResponse.status}`);
    // console.log("Feedback JSON Response:", jsonResponse.status);

    check(res3, {
      "Status code is 201": (r) => r.status === 201,
    });
  });

  group("Get All Feedback API", () => {
    const params3 = {
      headers: {
        "Content-Type": "application/json",
        "x-referer": "user",
        "device-id": deviceId,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const res4 = http.get(`${__ENV.BASEURL}/v1/feedback`, params3);
    check(res4, {
      "Status code is 200": (r) => r.status === 200,
    });
    // console.log(`Response Status: ${res.status}`);
    const jsonResponse = res4.json();
    //console.log(`Suggested business list:`, jsonResponse);
  });
  group("Feedback count API", () => {
    const params4 = {
      headers: {
        "Content-Type": "application/json",
        "x-referer": "user",
        "device-id": deviceId,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const res5 = http.get(`${__ENV.BASEURL}/v1/feedback/count`, params4);

    // console.log(`Response Status: ${res.status}`);
    const responseData = JSON.parse(res5.body);
    console.log(`User Feedback count = : ${responseData.data}`);
  });
}
/* bypass cred
{
     "000000": "ayushk+0@geekyants.com",
 }
     Run command by local = k6 run -e BASEURL=http://localhost:3000 -e EMAIL=ayushk+0@geekyants.com Email_Login_feedback.js
*/
