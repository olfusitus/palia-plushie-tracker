import { LocalStorageRepository } from './localStorageRepository';
import type { IStorageRepository } from './repository';

// This is where you could swap implementations in the future.
// For example:
// let repository: IStorageRepository;
// if (__TAURI__) {
//   repository = new TauriFileSystemRepository();
// } else {
//   repository = new LocalStorageRepository();
// }

const repository: IStorageRepository = new LocalStorageRepository();

export default repository;
// export * from './types'; // Re-export all types for easy access
