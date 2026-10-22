#include <iostream>
#include <iomanip>
#include <math.h>
using namespace std;

int main()
{
    int num;
    int max = 0,min = 0;
    long long sum = 0;

    cin >> num;

    if((num > 10000) &&
       (num <= 0))
    {
        return 0;
    }

    int *a = new int[num];

    if(a != NULL)
    {
    for(int i = 0; i < num; i++)
    {
        cin >> a[i];
        if((a[i] <= 1000000) &&
           (a[i] >= -1000000) )
        {   
        sum += (long long) a[i];
        if(i == 0)
        {
            max = a[i];
            min = a[i];
        }
        else if(max < a[i])
        {
            max = a[i];
        }
        else if(min > a[i])
        {
            min = a[i];
        }
        }
    }
    cout << fixed << setprecision(11) << min << " " << max << " " << sum << endl;

    delete a;
    }
    return 0;
}
