import SimpleITK as sitk

class Image:
    image = None
    size = None
    image_array = None

    def __init__(self, input_arg):
        if type(input_arg) == type(""):
            self.image = sitk.ReadImage( input_arg )
            self.size = self.image.GetSize()
        else:
            array = input_arg
            self.image_array = array
            self.size = [len(array), len(array[0]), len(array[0][0])]
        if len(self.size) != 3:
            raise "Image is %s dimensions, but can only handle 3." % (len(self.size))


    #layer - 0 based index of the Z index layer you are requesting
    def get_slice(self, layer):
        if layer  > self.size[2] -1:
            raise "Requested layer %s, but max layer is %s." % (layer, self.size[2] -1) 
        index = [0,0, layer]
        size = list( self.size )
        size[2] = 0  
        Extractor = sitk.ExtractImageFilter()
        Extractor.SetSize( size )
        Extractor.SetIndex( index )
        slice = Extractor.Execute(self.image)
        return slice

    def get_image(self):
        stack = []
        if self.image_array == None:
            self.image_array = self.__image_to_array(self.size, [0,0,0])
        return self.image_array

    def reduce(self):
        return Image(self.__reduce_array(self.get_image()))
          
    def __reduce_array(self, array):
        size = [len(array), len(array[0]), len(array[0][0])] 
        iterations = []
        for i in range(3):
            iterations.append(size[i]/2)
            if size[i]%2 > 0:
                iterations[i] += 1
        print iterations
        reduced = []
        for x in range(iterations[0]):           
            y_array = [] 
            for y in range(iterations[1]):
                z_array = []
                for z in range(iterations[2]):
                    z_array.append(self.__reduce_block(array, [x*2,y*2,z*2]))
                y_array.append(z_array)
            reduced.append(y_array)
        return reduced   

    def __reduce_block(self, array, start):
        size = [len(array), len(array[0]), len(array[0][0])]
        combo = 0
        num = 0
        for x in range(2):
            for y in range(2):
                for z in range(2):
                    if x + start[0] >= size[0] or y + start[1] >= size[1] or z + start[2] >= size[2]:
                        break 
                    num+=1
                    combo += array[start[0] + x][start[1] + y][start[2] + z]
        return combo/num

    def get_sample(self):
        start = [100,100, 90]
        size = [50, 50, 50]
        return self.__image_to_array(size, start)

    def __image_to_array(self, dims, offset):
        image = []
        for x in range(dims[0]):
            y_array = []  
            for y in range(dims[1]):
                z_array = []
                for z in range(dims[2]):
                    z_array.append(self.image.GetPixel(x + offset[0], y + offset[1], z + offset[2]))
                y_array.append(z_array)
            image.append(y_array)
        return image

        # stack = []
        #for z in range(dims[2]):
        #    plane = self.__slice_to_array(self.get_slice(z + offset[2]), dims[0:2], offset[0:2])
        #    stack.append(plane)
        #return stack 


    def __slice_to_array(self, slice, dims, offset):
        z_value = 0
        to_ret = []
        for x in range(dims[0]):
            tmp = []
            for y in range(dims[1]):
                tmp.append(slice.GetPixel(x + offset[0], y+offset[1], z_value))
            to_ret.append(tmp)
        return to_ret
