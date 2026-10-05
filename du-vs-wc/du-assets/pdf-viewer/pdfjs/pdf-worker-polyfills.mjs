// Side-effect module: installs on evaluation so a static import completes before pdfjs's worker
// script is evaluated. see libs/du/shared/util/mfe/README.md
const byteChunkSize = 0x8000;

const installUpsert = prototype => {
    if (typeof prototype.getOrInsert !== 'function') {
        prototype.getOrInsert = function (key, value) {
            if (this.has(key)) {
                return this.get(key);
            }
            this.set(key, value);
            return value;
        };
    }

    if (typeof prototype.getOrInsertComputed !== 'function') {
        prototype.getOrInsertComputed = function (key, callback) {
            if (this.has(key)) {
                return this.get(key);
            }
            const value = callback(key);
            this.set(key, value);
            return value;
        };
    }
};

const installByteConversions = () => {
    if (typeof Uint8Array.prototype.toBase64 !== 'function') {
        Uint8Array.prototype.toBase64 = function () {
            const chunks = [];
            for (let offset = 0; offset < this.length; offset += byteChunkSize) {
                chunks.push(String.fromCharCode(...this.subarray(offset, offset + byteChunkSize)));
            }
            return btoa(chunks.join(''));
        };
    }

    if (typeof Uint8Array.prototype.toHex !== 'function') {
        Uint8Array.prototype.toHex = function () {
            let hex = '';
            for (const byte of this) {
                hex += byte.toString(16).padStart(2, '0');
            }
            return hex;
        };
    }

    if (typeof Uint8Array.fromBase64 !== 'function') {
        Uint8Array.fromBase64 = value => {
            const binary = atob(value);
            const bytes = new Uint8Array(binary.length);
            for (let index = 0; index < binary.length; index += 1) {
                bytes[index] = binary.charCodeAt(index);
            }
            return bytes;
        };
    }
};

const installSumPrecise = () => {
    if (typeof Math.sumPrecise === 'function') {
        return;
    }

    Math.sumPrecise = values => {
        let sum = 0;
        let compensation = 0;
        let seen = false;

        for (const value of values) {
            if (typeof value !== 'number') {
                throw new TypeError('Math.sumPrecise: every value must be a number');
            }
            seen = true;
            const next = sum + value;
            compensation += Math.abs(sum) >= Math.abs(value)
                ? (sum - next) + value
                : (value - next) + sum;
            sum = next;
        }

        return seen ? sum + compensation : -0;
    };
};

installUpsert(Map.prototype);
installUpsert(WeakMap.prototype);
installByteConversions();
installSumPrecise();
