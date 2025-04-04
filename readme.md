<p align="center">
  <a href="https://jfinchain.com/" target="blank"><img src="https://static.wixstatic.com/media/ff114f_a8511d92b57c4e6ea27422ede46f5f57~mv2.png/v1/fill/w_69,h_69,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/JFIN%20Logo-06.png" height="100" alt="JFINCHAIN Logo" /></a>
</p>
<p align="center">JFIN CHAIN BEYOND THE FUTURE.</p>

<p align="center">
    <a href="https://www.facebook.com/JFINofficial" target="_blank">
        <img src="https://img.shields.io/badge/Facebook-1877F2?style=social&logo=facebook">
    </a>
    <a href="https://twitter.com/jfinofficial" target="_blank">
        <img src="https://img.shields.io/github/followers/jventures-jdn?style=social">
    </a>
</p>
<hr/>

<p align="center">
    Official <a href="https://github.com/jventures-jdn/project-staking-ui">Token Generator</a> Monorepo
</p>

### Web

- In order to start api, go to `token-generator-web` directory and run
  ```
  pnpm install (install dependencies)
  pnpm dev (run project)
  ```

### API

- In order to start api, go to `token-generator-api` directory and run
  ```
  pnpm install (install dependencies)
  pnpm dev (run project)
  ```

## Roadmap

### Project Structure

- [x] setup prettier, linter, tsconfig, tailwind configuration
- [x] setup workspace husky, commitlint, syncpack script configuration
- [x] setup frontend, backend, libs repo

### CI/CD

- [x] setup cloudflare configuration for web deployment
- [x] setup glcoud configuration for api for deployment
- [x] setup secrets for github actions
- [x] setup dockerfile for frontend
- [x] setup dockerfile for backend
- [x] make hardhat runable in backend container
- [x] make changeset release version when merge to main
- [ ] make changeset publish to npm when merge to main
- [x] github actions for build, test, deploy
- [x] github actions for release package
- [ ] github actions for publish package

### Backend

- [x] endpoint for read original, generated smart contract
- [x] endpoint for generate smart contract with new name
- [x] endpoint for compile generated smart contract
- [x] endpoint for verify generated smart contract
- [x] endpoint for remove generated & compile smart contract
- [x] endpoint for read abi, bytecode from compiled smart contract
- [x] setup test for contract endpoints
- [x] setup in-memory redis for testing & development

## Team

- [JVenture Team](https://github.com/orgs/jventures-jdn)

## Contact Us

For business inquiries: info@jventures.co.th
