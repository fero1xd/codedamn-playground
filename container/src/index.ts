import http from 'http';

http
  .request(
    {
      hostname: 'localhost',
      port: 2375,
      path: '/containers/f45cf62e2af1681b4268c21c2cf1388831839460810428f5e73d40559fb174dc/attach?stream=1&stdout=1&stdin=1&logs=1',
      method: 'POST',
    },
    function (s) {
      console.log('hi');
      const d: Buffer[] = [];
      console.log('Status Code:', s.statusCode);
      console.log('headers', s.headers);

      s.on('data', (data) => {
        console.log('data');
        console.log(data);
        d.push(data);
      });

      s.on('end', () => {
        console.log('ended response');
        console.log(Buffer.concat(d).toString());
      });
    }
  )
  .on('error', (e) => {
    console.log('error');
    console.log(e);
  });

console.log('hello world');
