import { FileLoader, TextureLoader } from 'three';

export const utils = (function () {
  return {
    loadFile: function (url) {
      return new Promise((resolve) => {
        new FileLoader().load(url, resolve);
      });
    },

    loadBinaryFile: function (url) {
      return new Promise((resolve) => {
        const loader = new FileLoader();
        loader.setResponseType('arraybuffer');
        loader.load(url, resolve);
      });
    },

    loadTexture: function (url) {
      return new Promise((resolve) => {
        new TextureLoader().load(url, resolve);
      });
    },

    getTexture: function (url) {
      return fetch(url)
        .then((response) => response.blob())
        .then((blob) => {
          return new Promise((resolve) =>
            new TextureLoader().load(URL.createObjectURL(blob), resolve)
          );
        });
    },
    getBinaryFile: function (url) {
      return fetch(url, {
        headers: { 'Content-Encoding': 'gzip', 'Content-Type': 'application/octet-stream' },
      }).then((response) => response.arrayBuffer());
    },
  };
})();
