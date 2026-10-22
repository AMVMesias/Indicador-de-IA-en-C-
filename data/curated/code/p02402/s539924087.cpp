#include <iostream>
#include <algorithm>
#include <array>
#include <cstdint>
#include <functional>
#include <map>
#include <math.h>
#include <queue>
#include <set>
#include <stdlib.h>
#include <string>
#include <utility>
#include <vector>

#define INF 1000000000
#define MOD 1000000007
#define ll long long
#define rep(i,a,b) for(int32 i = (a); i < (b); ++i)
#define rrep(i,a,b) for(int32 i = (b) - 1; i >= (a); --i)
#define bitget(a,b) (((a) >> (b)) & 1)
#define vint vector<int>
#define ALL(x) (x).begin(),(x).end()
#define C(x) cout << #x << " : " << x << endl
#define scanf scanf_s

using int32 = int_fast32_t;
using int64 = int_fast64_t;
using uint32 = uint_fast32_t;
using uint64 = uint_fast64_t;

using namespace std;


uint64 bitmaskr[64] = { 0xFFFFFFFFFFFFFFFE, 0xFFFFFFFFFFFFFFFC, 0xFFFFFFFFFFFFFFF8, 0xFFFFFFFFFFFFFFF0, 0xFFFFFFFFFFFFFFE0, 0xFFFFFFFFFFFFFFC0, 0xFFFFFFFFFFFFFF80, 0xFFFFFFFFFFFFFF00, 0xFFFFFFFFFFFFFE00, 0xFFFFFFFFFFFFFC00, 0xFFFFFFFFFFFFF800, 0xFFFFFFFFFFFFF000, 0xFFFFFFFFFFFFE000, 0xFFFFFFFFFFFFC000, 0xFFFFFFFFFFFF8000, 0xFFFFFFFFFFFF0000, 0xFFFFFFFFFFFE0000, 0xFFFFFFFFFFFC0000, 0xFFFFFFFFFFF80000, 0xFFFFFFFFFFF00000, 0xFFFFFFFFFFE00000, 0xFFFFFFFFFFC00000, 0xFFFFFFFFFF800000, 0xFFFFFFFFFF000000, 0xFFFFFFFFFE000000, 0xFFFFFFFFFC000000, 0xFFFFFFFFF8000000, 0xFFFFFFFFF0000000, 0xFFFFFFFFE0000000, 0xFFFFFFFFC0000000, 0xFFFFFFFF80000000, 0xFFFFFFFF00000000, 0xFFFFFFFE00000000, 0xFFFFFFFC00000000, 0xFFFFFFF800000000, 0xFFFFFFF000000000, 0xFFFFFFE000000000, 0xFFFFFFC000000000, 0xFFFFFF8000000000, 0xFFFFFF0000000000, 0xFFFFFE0000000000, 0xFFFFFC0000000000, 0xFFFFF80000000000, 0xFFFFF00000000000, 0xFFFFE00000000000, 0xFFFFC00000000000, 0xFFFF800000000000, 0xFFFF000000000000, 0xFFFE000000000000, 0xFFFC000000000000, 0xFFF8000000000000, 0xFFF0000000000000, 0xFFE0000000000000, 0xFFC0000000000000, 0xFF80000000000000, 0xFF00000000000000, 0xFE00000000000000, 0xFC00000000000000, 0xF800000000000000, 0xF000000000000000, 0xE000000000000000, 0xC000000000000000, 0x8000000000000000, 0x0000000000000000 };
uint64 bitmaskl[64] = { 0x0000000000000000, 0x0000000000000001, 0x0000000000000003, 0x0000000000000007, 0x000000000000000F, 0x000000000000001F, 0x000000000000003F, 0x000000000000007F, 0x00000000000000FF, 0x00000000000001FF, 0x00000000000003FF, 0x00000000000007FF, 0x0000000000000FFF, 0x0000000000001FFF, 0x0000000000003FFF, 0x0000000000007FFF, 0x000000000000FFFF, 0x000000000001FFFF, 0x000000000003FFFF, 0x000000000007FFFF, 0x00000000000FFFFF, 0x00000000001FFFFF, 0x00000000003FFFFF, 0x00000000007FFFFF, 0x0000000000FFFFFF, 0x0000000001FFFFFF, 0x0000000003FFFFFF, 0x0000000007FFFFFF, 0x000000000FFFFFFF, 0x000000001FFFFFFF, 0x000000003FFFFFFF, 0x000000007FFFFFFF, 0x00000000FFFFFFFF, 0x00000001FFFFFFFF, 0x00000003FFFFFFFF, 0x00000007FFFFFFFF, 0x0000000FFFFFFFFF, 0x0000001FFFFFFFFF, 0x0000003FFFFFFFFF, 0x0000007FFFFFFFFF, 0x000000FFFFFFFFFF, 0x000001FFFFFFFFFF, 0x000003FFFFFFFFFF, 0x000007FFFFFFFFFF, 0x00000FFFFFFFFFFF, 0x00001FFFFFFFFFFF, 0x00003FFFFFFFFFFF, 0x00007FFFFFFFFFFF, 0x0000FFFFFFFFFFFF, 0x0001FFFFFFFFFFFF, 0x0003FFFFFFFFFFFF, 0x0007FFFFFFFFFFFF, 0x000FFFFFFFFFFFFF, 0x001FFFFFFFFFFFFF, 0x003FFFFFFFFFFFFF, 0x007FFFFFFFFFFFFF, 0x00FFFFFFFFFFFFFF, 0x01FFFFFFFFFFFFFF, 0x03FFFFFFFFFFFFFF, 0x07FFFFFFFFFFFFFF, 0x0FFFFFFFFFFFFFFF, 0x1FFFFFFFFFFFFFFF, 0x3FFFFFFFFFFFFFFF, 0x7FFFFFFFFFFFFFFF };
struct VEBtip {
	uint32 root[2] = { ~static_cast<std::uint_fast32_t>(0) ,0};
	std::vector<uint64> tree;
	uint64 aux = 0;
	VEBtip() :tree(64) {}
	//key????????\
	void _insert(uint32 key) {
		if (!~root[0]) {
			root[0] = key;
			root[1] = key;
			return;
		}
		if (root[0] > key) {
			uint32 temp = key;
			key = root[0];
			root[0] = temp;
		}
		else if (root[1] < key) {
			root[1] = key;
		}
		if (!tree[key >> 6]) {
			aux |= 1LL << (key >> 6);
		}
		tree[key >> 6] |= 1LL << (key & 63);
		return;
	}
	//key?????????
	void _delete(uint32 key) {
		if (root[0] == key) {
			if (root[1] == key) {
				root[0] = ~static_cast<std::uint_fast32_t>(0);
				root[1] = 0;
			}
			else {
				root[0]= (__builtin_ctzll(aux) << 6) | __builtin_ctzll(tree[__builtin_ctzll(aux)]);
				tree[root[0] >> 6] &= ~(1LL << (root[0] & 63));
				if (!tree[root[0] >> 6]) {
					aux &= ~(1LL << (root[0] >> 6));
				}
			}
		}
		else {
			if (root[1] == key) {
				tree[key >> 6] &= ~(1LL << (key & 63));
				if (!tree[key >> 6]) {
					aux &= ~(1LL << (key >> 6));
				}
				if (aux) {
					root[1] = ((63 ^ (__builtin_clzll(aux))) << 6) | (63 ^ __builtin_clzll(tree[63 ^ __builtin_clzll(aux)]));
				}
				else {
					root[1] = root[0];
				}
			}
			else {
				tree[key >> 6] &= ~(1LL << (key & 63));
				if (!tree[key >> 6]) {
					aux &= ~(1LL << (key >> 6));
				}
			}
		}
		return;
	}
	//key????????¨?????????
	bool _find(const uint32 &key) {
		return tree[key >> 6] >> (key & 63) & 1 || root[0] == key;
	}
	//key????????§??????????°????????´?:????´?????????¨???????¨???????????????????
	uint32 _findnext(const uint32 &key) {
		if (root[0] > key) {
			return root[0];
		}
		if (tree[key >> 6] & bitmaskr[key & 63]) {
			return (key & 4032) | __builtin_ctzll(tree[key >> 6] & bitmaskr[key & 63]);
		}
		return (__builtin_ctzll(aux&bitmaskr[key >> 6]) << 6) | __builtin_ctzll(tree[__builtin_ctzll(aux&bitmaskr[key >> 6])]);
	}
	//key???????°????????????§???????´?
	uint32 _findprev(const uint32 &key) {
		if (tree[key >> 6] & bitmaskl[key & 63]) {
			return (key & 4032) | (63 ^ __builtin_clzll(tree[key >> 6] & bitmaskl[key & 63]));
		}
		else {
			if (aux&bitmaskl[key >> 6]) {
				return ((63 ^ (__builtin_clzll(aux&bitmaskl[key >> 6]))) << 6) | (63 ^ __builtin_clzll(tree[63 ^ __builtin_clzll(aux&bitmaskl[key >> 6])]));
			}
			else {
				return ~static_cast<std::uint_fast32_t>(0);
			}
		}
	}
};

class VEBTree {
	uint32 root[2] = { ~static_cast<std::uint_fast32_t>(0),~static_cast<std::uint_fast32_t>(0) };
	vector<VEBtip> tree;
	VEBtip aux;
	uint32 temp, now;
public:
	VEBTree() :tree(4096) {}
	//???????????????
	bool _empty() {
		return !~root[0];
	}
	//????°????
	uint32 _min() {
		return root[0];
	}
	//?????§???
	uint32 _max() {
		return root[1];
	}
	//key????????\
	void _insert(uint32 key) {
		if (!~root[0]) {
			root[0] = key;
			root[1] = key;
			return;
		}
		if (root[0] > key) {
			temp = key;
			key = root[0];
			root[0] = temp;
		}
		else if (root[1] < key) {
			root[1] = key;
		}
		if (!~tree[key >> 12].root[0]) {
			aux._insert(key >> 12);
		}
		tree[key >> 12]._insert(key & 4095);
	}
	//key?????????
	void _delete(uint32 key) {
		if (root[0] == key) {
			if (root[1] == key) {
				root[0] = ~static_cast<std::uint_fast32_t>(0);
				root[1] = ~static_cast<std::uint_fast32_t>(0);
				return;
			}
			root[0] = aux.root[0] << 12 | tree[aux.root[0]].root[0];
			tree[root[0] >> 12]._delete(root[0] & 4095);
			if (!~tree[root[0] >> 12].root[0]) {
				aux._delete(root[0] >> 12);
			}
			return;
		}
		tree[key >> 12]._delete(key & 4095);
		if (!~tree[key >> 12].root[0]) {
			aux._delete(key >> 12);
		}
		if (root[1] == key) {
			if (!~aux.root[0]) {
				root[1] = root[0];
				return;
			}
			root[1] = aux.root[1] << 12 | tree[aux.root[1]].root[1];
			return;
		}
		return;
	}
	//key????????¨?????????
	bool _find(const uint32 &key) {
		return tree[key >> 12]._find(key & 4095) || root[0] == key;
	}
	//key????????§??????????°????????´?
	uint32 _findnext(const uint32 &key) {
		if (root[1] <= key) {
			return ~static_cast<std::uint_fast32_t>(0);
		}
		if (root[0] > key) {
			return root[0];
		}
		if (tree[key >> 12].root[1] <= key & 4095) {
			return aux._findnext(key >> 12) << 12 | tree[aux._findnext(key >> 12)].root[0];
		}
		return key & 16773120 | tree[key >> 12]._findnext(key & 4095);
	}
	//key???????°????????????§???????´?
	uint32 _findprev(const uint32 &key) {

	}
};


int main() {
	std::ios::sync_with_stdio(false);
	std::cin.tie(0);
	VEBTree t;
	uint32 n;
	cin >> n;
	int32 a;
	int64 sum = 0;
	rep(i, 0, n) {
		cin >> a;
		sum += a;
		a += 1e6;
		if (!t._find(a)) { t._insert(a); }
	}
	int32 Max = t._max(), Min = t._min();
	Min -= 1e6;Max -= 1e6;
	cout << Min << " " << Max << " " << sum << endl;
	return 0;
}