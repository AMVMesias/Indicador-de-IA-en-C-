#include <bits/stdc++.h>
#include <string>
using namespace std;

int main(void){
	string nu;
	while(cin >> nu){
		if(nu[0] == '0') break;
		int ans = 0;
		for(int i=0; i<nu.length(); i++){
			ans += nu[i] - '0';
		}
		printf("%d\n", ans);
	}

	return 0;
}