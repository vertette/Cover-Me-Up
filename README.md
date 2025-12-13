# Cover-Me-Up

*Cover Me Up* is a web application that lets you quickly create and export art assets for products sold on online stores such as Steam, Itch or GOG. In contrast to standard photo editors, Cover Me Up is built for quick and easy editing for assets that need to be exported to dozens of different resolutions. No constant fussing with layer positions or canvas sizes.

Presets are divided by platform and resolution. Each resolution with an asterisk is a required asset, and each newly selected resolution will reuse the settings of the previous one, though changing them after that will not affect other presets.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/vertette/Cover-Me-Up.git
    cd Cover-Me-Up
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    By default, the app should run at `http://localhost:3000/` as all Nuxt projects do.

### Building for production

To build production:
```bash
npm run generate
# or
yarn generate
```

## Contributing

I welcome contributions that fit in the spirit of the project. Feel free to submit pull requests, create issues, or suggest features.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## License

This project is licensed under the  
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

Under the following terms:
- **Attribution** — You must give appropriate credit.
- **NonCommercial** — You may not use the material for commercial purposes.
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license.