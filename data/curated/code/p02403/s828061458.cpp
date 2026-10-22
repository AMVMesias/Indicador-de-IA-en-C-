#include <iostream>
#include <vector>

using namespace std;

int main() {
	vector<int> v1;
	vector<int> v2;
	int h;
	int w;
	bool IsInput = true;

	while (IsInput) {
		cin >> h >> w;
		if (h == 0 && w == 0) {
			break;
		}
		v1.push_back(h);
		v2.push_back(w);
	}
	
	for(int i = 0; i < v1.size();i++){
		for (int j = 0; j < v1[i];j++) {
			for (int k = 0; k < v2[i]; k++) {
				cout << "#";
			}
			cout << endl;
		}
		cout << endl;
	}
	return 0;
}
