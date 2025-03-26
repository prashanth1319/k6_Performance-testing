import http from 'k6/http';
import { check } from 'k6';

export default function () {
    let res = http.get('https://test-api.example.com');
    check(res, { 'status is 200': (r) => r.status === 200 });
}
