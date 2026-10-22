#include <iostream>
#include <algorithm>

using namespace std;

int main()
{
  long n;
  cin >> n;
  int arr[n];
  for (int i = 0; i < n; i++)
  {
    cin >> arr[i];
  }

  long sum_of_elems = 0;
  for (auto &n : arr)
    sum_of_elems += n;

  cout << *min_element(arr, arr + n) << " ";
  cout << *max_element(arr, arr + n) << " ";
  cout << sum_of_elems << endl;
}