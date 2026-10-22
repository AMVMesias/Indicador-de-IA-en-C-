#include <iostream>
#include <queue>
using namespace std;

int main(int argc, char* argv[]) {
  queue<int> q;
  int x, y;

  cin >> x >> y;
  while(!(x == 0 && y == 0)){
    q.push(x);
    q.push(y);
    cin >> x >> y;
  }

  while(!q.empty()){
    x = q.front();
    q.pop();
    y = q.front();
    q.pop();
    for(int j = 0 ; j < x ; j++){
      for(int k = 0 ; k < y ; k++){
        cout << "#";
      }
      cout << endl;
    }
    cout << endl;
  }

  return 0;
}