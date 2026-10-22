#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main(void)
{
	int H, W;
	std::vector<int> h, w;
	
	int cnt = 0;
	while(1)
	{
		std::cin >> H >> W;
		
		if( H == 0 && W == 0 ) break;
		
		else 
		{
			h.push_back(H);
			w.push_back(W);
		}
		
		cnt++;
	}
		
	for(int i = 0; i < cnt; i++)
	{
		for(int j = 0; j < h[i]; j++)
		{
			for(int k = 0; k < w[i]; k++)
			{
				std::cout << "#";
			}
			
			std::cout << std::endl;
		}
		
		std::cout << std::endl;
	}

	return 0;
}
