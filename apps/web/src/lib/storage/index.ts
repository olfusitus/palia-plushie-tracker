// import { LocalStorageRepository } from './localStorageRepository';
import { IndexedDBRepository } from './IndexedDBRepository';
import { DummyRepository } from './repository';
import { StorageService } from './storageService';

// This is where you could swap implementations in the future.
// For example:
// let repository: IStorageRepository;
// if (__TAURI__) {
//   repository = new TauriFileSystemRepository();
// } else {
//   repository = new LocalStorageRepository();
// }
// const storageService = new StorageService(new LocalStorageRepository());

export function getRepository() {
	if (typeof window !== 'undefined' && window.indexedDB) {
		return new IndexedDBRepository();
	}
	return new DummyRepository();
}

const storageService = new StorageService(getRepository());
export { storageService };
// export * from './types'; // Re-export all types for easy access
