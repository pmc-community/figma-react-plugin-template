require 'json'

module Jekyll

    module Categories
        class CatList < Liquid::Tag
  
            def initialize(tag_name, input, context)
                super
                @input = input
            end

            def render(context)
                begin
                    if( !@input.nil? && !@input.empty? )
                        info = JSON.parse(@input)
                    end
                    rescue
                end
                context.registers[:site].data["category_list"]
            end
        end
    end
end
  
Liquid::Template.register_tag('CatList', Jekyll::Categories::CatList)
  